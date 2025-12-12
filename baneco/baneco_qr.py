#!/usr/bin/env python3
"""
Banco Económico - Generación de QR
Implementación del flujo de autenticación y generación de códigos QR
según la documentación de la API v1.3.0
"""

import requests
import json
import logging
import os
from datetime import datetime, timedelta
from typing import Dict, Optional
from pathlib import Path

# Configure paths
BASE_DIR = Path(__file__).parent
LOGS_DIR = BASE_DIR / 'docs' / 'logs'
LOGS_DIR.mkdir(parents=True, exist_ok=True)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOGS_DIR / 'qr.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('BanecoQR')


class BanecoQRGenerator:
    """Cliente para interactuar con la API del Banco Económico"""
    
    def __init__(self, base_url: str, username: str, password: str, aes_key: str, account: str):
        """
        Inicializa el cliente de Baneco
        
        Args:
            base_url: URL base de la API
            username: Usuario para autenticación
            password: Contraseña en texto plano
            aes_key: Clave AES para encriptación
            account: Número de cuenta para créditos
        """
        self.base_url = base_url
        self.username = username
        self.password = password
        self.aes_key = aes_key
        self.account = account
        self.token: Optional[str] = None
        self.password_enc: Optional[str] = None
        self.account_enc: Optional[str] = None
        
        logger.info("="*80)
        logger.info("BanecoQRGenerator initialized")
        logger.info(f"Base URL: {base_url}")
        logger.info(f"Username: {username}")
        logger.info(f"Account: {account}")
        logger.info("="*80)
    
    def encrypt_text(self, text: str) -> str:
        """
        Encripta un texto usando el endpoint de encriptación del banco
        
        Args:
            text: Texto a encriptar
            
        Returns:
            Texto encriptado
            
        Raises:
            Exception: Si la encriptación falla
        """
        url = f"{self.base_url}/api/authentication/encrypt"
        params = {
            "text": text,
            "aesKey": self.aes_key
        }
        
        logger.info("--- ENCRYPT REQUEST ---")
        logger.info(f"URL: {url}")
        logger.info(f"Params: text=***HIDDEN***, aesKey={self.aes_key}")
        
        print(f"🔐 Encriptando texto...")
        response = requests.get(url, params=params)
        
        logger.info(f"Response Status: {response.status_code}")
        
        if response.status_code != 200:
            logger.error(f"Encryption failed: {response.status_code} - {response.text}")
            raise Exception(f"Error al encriptar: {response.status_code} - {response.text}")
        
        encrypted = response.json()
        logger.info(f"Encrypted text: {encrypted[:20]}...")
        logger.info("Encryption successful")
        
        print(f"✅ Texto encriptado exitosamente")
        return encrypted
    
    def authenticate(self) -> str:
        """
        Realiza la autenticación y obtiene el token de acceso
        
        Returns:
            Token de autenticación
            
        Raises:
            Exception: Si la autenticación falla
        """
        # Primero encriptar la contraseña si no está encriptada
        if not self.password_enc:
            logger.info("Password not encrypted, encrypting now...")
            self.password_enc = self.encrypt_text(self.password)
        
        url = f"{self.base_url}/api/authentication/authenticate"
        headers = {
            "Content-Type": "application/json"
        }
        body = {
            "userName": self.username,
            "password": self.password_enc
        }
        
        logger.info("--- AUTHENTICATE REQUEST ---")
        logger.info(f"URL: {url}")
        logger.info(f"Headers: {json.dumps(headers, indent=2)}")
        logger.info(f"Payload: {json.dumps({'userName': self.username, 'password': '***ENCRYPTED***'}, indent=2)}")
        
        print(f"🔑 Autenticando usuario {self.username}...")
        response = requests.post(url, headers=headers, json=body)
        
        logger.info(f"Response Status: {response.status_code}")
        
        if response.status_code != 200:
            logger.error(f"Authentication failed: {response.status_code} - {response.text}")
            raise Exception(f"Error en autenticación: {response.status_code} - {response.text}")
        
        data = response.json()
        logger.info(f"Response Data: {json.dumps(data, indent=2)}")
        
        self.token = data.get("token")
        
        if not self.token:
            logger.error("No token received in response")
            raise Exception("No se recibió token en la respuesta")
        
        logger.info(f"Token received: {self.token[:20]}...")
        logger.info("Authentication successful")
        
        print(f"✅ Autenticación exitosa")
        print(f"   Token: {self.token[:20]}...")
        return self.token
    
    def generate_qr(
        self,
        transaction_id: str,
        amount: float,
        description: str,
        currency: str = "BOB",
        due_date: Optional[str] = None,
        single_use: bool = True,
        modify_amount: bool = False,
        branch_code: str = "E0001"
    ) -> Dict:
        """
        Genera un código QR para pagos
        
        Args:
            transaction_id: ID único de la transacción
            amount: Monto del pago
            description: Descripción del pago
            currency: Moneda (BOB o USD)
            due_date: Fecha de vencimiento (YYYY-MM-DD), por defecto 30 días
            single_use: Si el QR es de un solo uso
            modify_amount: Si se permite modificar el monto
            branch_code: Código de sucursal
            
        Returns:
            Diccionario con los datos del QR generado
            
        Raises:
            Exception: Si la generación del QR falla
        """
        # Autenticar si no hay token
        if not self.token:
            logger.info("No token available, authenticating...")
            self.authenticate()
        
        # Encriptar cuenta si no está encriptada
        if not self.account_enc:
            logger.info("Account not encrypted, encrypting now...")
            self.account_enc = self.encrypt_text(self.account)
        
        # Fecha de vencimiento por defecto: 30 días desde hoy
        if not due_date:
            due_date = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")
            logger.info(f"No due date provided, using default: {due_date}")
        
        url = f"{self.base_url}/api/qrsimple/generateQR"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.token}"
        }
        body = {
            "transactionId": transaction_id,
            "accountCredit": self.account_enc,
            "currency": currency,
            "amount": amount,
            "description": description,
            "dueDate": due_date,
            "singleUse": single_use,
            "modifyAmount": modify_amount,
            "branchCode": branch_code
        }
        
        logger.info("--- GENERATE QR REQUEST ---")
        logger.info(f"URL: {url}")
        logger.info(f"Headers: {json.dumps({'Content-Type': 'application/json', 'Authorization': 'Bearer ***TOKEN***'}, indent=2)}")
        logger.info(f"Payload: {json.dumps({**body, 'accountCredit': '***ENCRYPTED***'}, indent=2)}")
        
        print(f"\n📱 Generando QR...")
        print(f"   Transaction ID: {transaction_id}")
        print(f"   Monto: {amount} {currency}")
        print(f"   Descripción: {description}")
        print(f"   Vencimiento: {due_date}")
        
        response = requests.post(url, headers=headers, json=body)
        
        logger.info(f"Response Status: {response.status_code}")
        
        if response.status_code != 200:
            logger.error(f"QR generation failed: {response.status_code} - {response.text}")
            raise Exception(f"Error al generar QR: {response.status_code} - {response.text}")
        
        qr_data = response.json()
        
        # Log response without the large base64 image
        qr_data_log = {k: v if k != 'qrImage' else f"***BASE64_IMAGE_{len(v)}_CHARS***" for k, v in qr_data.items()}
        logger.info(f"Response Data: {json.dumps(qr_data_log, indent=2)}")
        logger.info("QR generation successful")
        
        print(f"✅ QR generado exitosamente")
        
        if "qrId" in qr_data:
            print(f"   QR ID: {qr_data['qrId']}")
            logger.info(f"QR ID: {qr_data['qrId']}")
        
        return qr_data
    
    def decrypt_text(self, encrypted_text: str) -> str:
        """
        Desencripta un texto usando el endpoint de desencriptación del banco
        
        Args:
            encrypted_text: Texto encriptado
            
        Returns:
            Texto desencriptado
            
        Raises:
            Exception: Si la desencriptación falla
        """
        url = f"{self.base_url}/api/authentication/decrypt"
        params = {
            "text": encrypted_text,
            "aesKey": self.aes_key
        }
        
        logger.info("--- DECRYPT REQUEST ---")
        logger.info(f"URL: {url}")
        logger.info(f"Params: text={encrypted_text[:20]}..., aesKey={self.aes_key}")
        
        response = requests.get(url, params=params)
        
        logger.info(f"Response Status: {response.status_code}")
        
        if response.status_code != 200:
            logger.error(f"Decryption failed: {response.status_code} - {response.text}")
            raise Exception(f"Error al desencriptar: {response.status_code} - {response.text}")
        
        decrypted = response.json()
        logger.info(f"Decrypted text: ***HIDDEN***")
        logger.info("Decryption successful")
        
        return decrypted


def main():
    """Función principal de demostración"""
    
    # Configuración de credenciales
    BASE_URL = "https://apimktdesa.baneco.com.bo/ApiGateway"
    USERNAME = "1649710"
    PASSWORD = "1234"
    AES_KEY = "6F09E3167E1D40829207B01041A65B12"
    ACCOUNT = "1041070599"
    
    print("=" * 60)
    print("🏦 BANCO ECONÓMICO - GENERACIÓN DE QR")
    print("=" * 60)
    print()
    
    logger.info("="*80)
    logger.info("STARTING QR GENERATION DEMO")
    logger.info("="*80)
    
    try:
        # Crear instancia del generador
        qr_generator = BanecoQRGenerator(
            base_url=BASE_URL,
            username=USERNAME,
            password=PASSWORD,
            aes_key=AES_KEY,
            account=ACCOUNT
        )
        
        # Generar QR de demostración
        transaction_id = f"TXN-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        logger.info(f"Generated transaction ID: {transaction_id}")
        
        qr_result = qr_generator.generate_qr(
            transaction_id=transaction_id,
            amount=100.50,
            description="Pago de demostración - Unifranz",
            currency="BOB",
            single_use=True,
            modify_amount=False
        )
        
        # Mostrar resultado
        print("\n" + "=" * 60)
        print("📋 RESULTADO DE LA GENERACIÓN")
        print("=" * 60)
        print(json.dumps(qr_result, indent=2, ensure_ascii=False))
        
        # Guardar resultado en archivo JSON
        output_file = LOGS_DIR / f"qr_result_{transaction_id}.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(qr_result, f, indent=2, ensure_ascii=False)
        
        logger.info(f"QR result saved to: {output_file}")
        print(f"\n💾 Resultado guardado en: {output_file}")
        
        # Si hay imagen QR en base64, guardarla
        if "qrImage" in qr_result:
            import base64
            qr_image_file = LOGS_DIR / f"qr_image_{transaction_id}.png"
            
            # Decodificar y guardar imagen
            image_data = base64.b64decode(qr_result["qrImage"])
            with open(qr_image_file, 'wb') as f:
                f.write(image_data)
            
            logger.info(f"QR image saved to: {qr_image_file}")
            logger.info(f"QR image size: {len(image_data)} bytes")
            print(f"🖼️  Imagen QR guardada en: {qr_image_file}")
        
        logger.info("="*80)
        logger.info("QR GENERATION DEMO COMPLETED SUCCESSFULLY")
        logger.info("="*80)
        print("\n✅ Proceso completado exitosamente")
        
    except Exception as e:
        logger.error("="*80)
        logger.error(f"ERROR IN QR GENERATION: {str(e)}")
        logger.error("="*80)
        logger.exception("Full traceback:")
        
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main())
