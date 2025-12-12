## Overview
The `BanecoQRGenerator` class now includes comprehensive logging to track all API operations, payloads sent, and responses received.

## Directory Structure
All logs, QR images, and JSON results are saved in:
- **Directory**: `docs/logs/`
- **Files**:
  - `qr.log` - Main log file
  - `qr_result_*.json` - QR generation results
  - `qr_image_*.png` - QR code images

## Log File Location
- **File**: `docs/logs/qr.log`
- **Encoding**: UTF-8
- **Format**: `%(asctime)s - %(name)s - %(levelname)s - %(message)s`

## What Gets Logged

### 1. Initialization
- Base URL
- Username
- Account number

### 2. Encryption Operations
- Request URL
- Parameters (sensitive data hidden)
- Response status code
- Encrypted text (first 20 characters)
- Success/failure status

### 3. Authentication
- Request URL
- Headers
- Payload (password encrypted and hidden)
- Response status code
- Full response data (including token)
- Token received (first 20 characters)
- Success/failure status

### 4. QR Generation
- Request URL
- Headers (token hidden)
- Complete payload (account encrypted and hidden)
- Response status code
- Response data (base64 image size shown, not full content)
- QR ID
- Success/failure status

### 5. Decryption Operations
- Request URL
- Parameters (encrypted text shown partially)
- Response status code
- Success/failure status

### 6. Main Execution Flow
- Demo start
- Transaction ID generation
- File save operations
- Image save operations with size
- Demo completion
- Error tracking with full traceback

## Security Features

### Sensitive Data Protection
The logging implementation protects sensitive information:

- **Passwords**: Shown as `***HIDDEN***` or `***ENCRYPTED***`
- **Tokens**: Shown as `Bearer ***TOKEN***` in headers, first 20 chars in logs
- **Encrypted Data**: Shown as `***ENCRYPTED***`
- **Base64 Images**: Shown as `***BASE64_IMAGE_<size>_CHARS***`
- **Plain Text**: Shown as `***HIDDEN***` when being encrypted

## Example Log Output

```
2025-12-12 20:40:27,699 - BanecoQR - INFO - ================================================================================
2025-12-12 20:40:27,699 - BanecoQR - INFO - STARTING QR GENERATION DEMO
2025-12-12 20:40:27,700 - BanecoQR - INFO - BanecoQRGenerator initialized
2025-12-12 20:40:27,700 - BanecoQR - INFO - Base URL: https://apimktdesa.baneco.com.bo/ApiGateway
2025-12-12 20:40:27,700 - BanecoQR - INFO - Username: 1649710
2025-12-12 20:40:27,700 - BanecoQR - INFO - Account: 1041070599
2025-12-12 20:40:27,700 - BanecoQR - INFO - Generated transaction ID: TXN-20251212204027
2025-12-12 20:40:27,700 - BanecoQR - INFO - --- ENCRYPT REQUEST ---
2025-12-12 20:40:27,700 - BanecoQR - INFO - URL: https://apimktdesa.baneco.com.bo/ApiGateway/api/authentication/encrypt
2025-12-12 20:40:27,700 - BanecoQR - INFO - Params: text=***HIDDEN***, aesKey=6F09E3167E1D40829207B01041A65B12
2025-12-12 20:40:28,255 - BanecoQR - INFO - Response Status: 200
2025-12-12 20:40:28,255 - BanecoQR - INFO - Encrypted text: 6oV79y9jbrtZBSP/9SJR...
2025-12-12 20:40:28,255 - BanecoQR - INFO - Encryption successful
```

## Benefits

1. **Debugging**: Easy to trace issues with complete request/response logging
2. **Audit Trail**: Complete record of all API operations
3. **Security**: Sensitive data is masked while maintaining useful information
4. **Performance Tracking**: Timestamps show operation duration
5. **Error Analysis**: Full exception tracebacks for failures
6. **Compliance**: Detailed logs for regulatory requirements

## Usage

The logging is automatic and requires no additional configuration. Simply run the script:

```bash
python3 baneco_qr.py
```

All output files will be automatically created in the `docs/logs/` directory:
- `docs/logs/qr.log` - Log file with all operations
- `docs/logs/qr_result_*.json` - QR generation results
- `docs/logs/qr_image_*.png` - QR code images

## Log Rotation (Future Enhancement)

For production use, consider implementing log rotation:

```python
from logging.handlers import RotatingFileHandler

handler = RotatingFileHandler(
    'qr.log',
    maxBytes=10*1024*1024,  # 10MB
    backupCount=5,
    encoding='utf-8'
)
```
