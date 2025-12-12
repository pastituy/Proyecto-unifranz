import React, { useState, useEffect } from 'react';
import { 
  BlogSectionContainer, 
  SectionTitle, 
  BlogGrid, 
  BlogCard, 
  BlogImage, 
  BlogDate, 
  BlogTitle, 
  BlogExcerpt, 
  ReadMoreButton,
  TitleAccent,
  BlogHeader
} from '../../styles/styleSectionBlog';
import { FaCalendarAlt, FaArrowLeft, FaShare, FaFacebook, FaTwitter, FaInstagram, FaReply, FaArrowDown } from 'react-icons/fa';
import axios from 'axios';
import styled from 'styled-components';

const BlogSection = () => {
  const [showDetailView, setShowDetailView] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [blogPosts, setBlogPosts] = useState([]);
  const [visiblePosts, setVisiblePosts] = useState(3); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);


    const fetchBlogs = async () => {
      try {
        const response = await axios.get('http://localhost:3000/blog');
        setBlogPosts(response.data.data);
        setLoading(false);
      } catch (error) {
        setError('Error al cargar los blogs');
        setLoading(false);
        console.error('Error fetching blogs:', error);
      }
    };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const loadMorePosts = () => {
    setVisiblePosts(blogPosts.length);
  };

  const handleReadMore = (blog) => {
     const fetchBlogDetails = async (blogId) => {
      try {
        const response = await axios.get(`http://localhost:3000/blog/${blogId}`);
        setSelectedBlog(response.data.data);
        setShowDetailView(true);
        window.scrollTo(0, 0);
      } catch (error) {
        console.error('Error al cargar el detalle del blog:', error);
        alert('No se pudo cargar el detalle del blog');
      }
    };
    
    fetchBlogDetails(blog.id);
  };
  
  const handleBack = () => {
   fetchBlogs();
    setShowDetailView(false);
    setSelectedBlog(null);
    setReplyingTo(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const handleCommentSubmit = async (e) => {
     e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await axios.post('http://localhost:3000/comentarios', {
        comentario: commentText,
        idBlog: selectedBlog.id
      });
      
      const response = await axios.get(`http://localhost:3000/blog/${selectedBlog.id}`);
      setSelectedBlog(response.data.data);
      setCommentText('');
    } catch (error) {
      console.error('Error al publicar comentario:', error);
      alert('No se pudo publicar el comentario');
    }
  };

  const handleReplyToggle = (commentId) => {
    setReplyingTo(replyingTo === commentId ? null : commentId);
    setReplyText('');
  };


  const handleReplySubmit = async (e, commentId) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      await axios.post('http://localhost:3000/respuesta', {
        respuesta: replyText,
        idComentario: commentId
      });
      
      const response = await axios.get(`http://localhost:3000/blog/${selectedBlog.id}`);
      setSelectedBlog(response.data.data);
      setReplyText('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error al publicar respuesta:', error);
      alert('No se pudo publicar la respuesta');
    }
  };

  if (loading) return <div>Cargando blogs...</div>;
  if (error) return <div>{error}</div>;
  
  return (
      <BlogSectionContainer>
      {!showDetailView ? (
        <>
          <BlogHeader>
            <SectionTitle>Ultimas <TitleAccent>noticias</TitleAccent> & Historias</SectionTitle>
          </BlogHeader>
          <BlogGrid>
            {blogPosts?.slice(0, visiblePosts).map((post) => (
              <BlogCard key={post.id}>
                <BlogImage imageUrl={post.imagen}>
                  <BlogDate>{formatDate(post.fecha)}</BlogDate>
                </BlogImage>
                <BlogTitle>{post.titulo}</BlogTitle>
                <BlogExcerpt>{post.excerpt}</BlogExcerpt>
                <ReadMoreButton onClick={() => handleReadMore(post)}>Leer más</ReadMoreButton>
              </BlogCard>
            ))}
          </BlogGrid>
          
          {/* Botón para cargar más noticias */}
          {visiblePosts < blogPosts?.length && (
            <LoadMoreContainer>
              <LoadMoreButton onClick={loadMorePosts}>
                Ver más noticias <FaArrowDown />
              </LoadMoreButton>
            </LoadMoreContainer>
          )}
        </>
      ) : (
        <BlogDetailView>
          <BlogDetailHeader>
            <BackButton onClick={handleBack}>
              <FaArrowLeft /> Volver a noticias
            </BackButton>
            <ShareContainer>
              <ShareText>Compartir:</ShareText>
              <SocialIcons>
                <SocialIcon>
                  <FaFacebook />
                </SocialIcon>
                <SocialIcon>
                  <FaTwitter />
                </SocialIcon>
                <SocialIcon>
                  <FaInstagram />
                </SocialIcon>
              </SocialIcons>
            </ShareContainer>
          </BlogDetailHeader>
          
          <BlogDetailHero imageUrl={selectedBlog?.imagen}>
            <BlogDetailOverlay>
              <BlogDetailCategory>{selectedBlog?.categoria?.nombre}</BlogDetailCategory>
              <BlogDetailTitle>{selectedBlog?.titulo}</BlogDetailTitle>
              <BlogDetailMeta>
                <BlogDetailAuthor>{selectedBlog?.autor}</BlogDetailAuthor>
                <BlogDetailDateWrapper>
                  <FaCalendarAlt />
                  <span>{formatDate(selectedBlog?.fecha)}</span>
                </BlogDetailDateWrapper>
              </BlogDetailMeta>
            </BlogDetailOverlay>
          </BlogDetailHero>
          
          <BlogDetailContent>
            {/* Renderizar contenidos del blog en orden */}
            {selectedBlog?.contenidos?.length > 0 ? (
              selectedBlog.contenidos.map((contenido) => (
                <div key={contenido.id}>
                  {contenido.titulo && <h3>{contenido.titulo}</h3>}
                  <p>{contenido.texto}</p>
                </div>
              ))
            ) : (
              <p>{selectedBlog?.excerpt}</p>
            )}
          </BlogDetailContent>
          
          <BlogDetailTags>
            {selectedBlog?.tags?.map((tag) => (
              <BlogDetailTag key={tag.id}>{tag.nombre}</BlogDetailTag>
            ))}
          </BlogDetailTags>
          
          {/* Sección de comentarios */}
          <CommentsSection>
            <CommentsTitle>Comentarios ({selectedBlog?.comentarios?.length || 0})</CommentsTitle>
            
            {selectedBlog?.comentarios?.map((comment) => (
              <CommentCard key={comment.id}>
                <CommentText>{comment.comentario}</CommentText>
                <ReplyButton onClick={() => handleReplyToggle(comment.id)}>
                  <FaReply /> Responder
                </ReplyButton>
                
                {/* Respuestas a este comentario */}
                {comment.respuesta?.map((reply) => (
                  <ReplyCard key={reply.id}>
                    <ReplyText>{reply.respuesta}</ReplyText>
                  </ReplyCard>
                ))}
                
                {/* Formulario para responder */}
                {replyingTo === comment.id && (
                  <ReplyForm onSubmit={(e) => handleReplySubmit(e, comment.id)}>
                    <ReplyInput
                      placeholder="Escribe tu respuesta..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      required
                    />
                    <SubmitButton type="submit">Responder</SubmitButton>
                  </ReplyForm>
                )}
              </CommentCard>
            ))}
            
            {/* Formulario para comentar */}
            <CommentForm onSubmit={handleCommentSubmit}>
              <CommentsTitle>Deja tu comentario</CommentsTitle>
              <CommentInput
                placeholder="Escribe tu comentario..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                required
              />
              <SubmitButton type="submit">Publicar comentario</SubmitButton>
            </CommentForm>
          </CommentsSection>
          
          <BlogDetailFooter>
            <RelatedArticlesTitle>Artículos relacionados</RelatedArticlesTitle>
            <RelatedArticlesGrid>
              {blogPosts
                .filter(post => post.id !== selectedBlog?.id)
                .slice(0, 2)
                .map((post) => (
                  <RelatedArticleCard key={post.id} onClick={() => handleReadMore(post)}>
                    <RelatedArticleImage imageUrl={post.imagen}>
                      <RelatedArticleDate>{formatDate(post.fecha)}</RelatedArticleDate>
                    </RelatedArticleImage>
                    <RelatedArticleTitle>{post.titulo}</RelatedArticleTitle>
                  </RelatedArticleCard>
                ))}
            </RelatedArticlesGrid>
          </BlogDetailFooter>
        </BlogDetailView>
      )}
    </BlogSectionContainer>
  );
};

export default BlogSection;

const BlogDetailView = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const BlogDetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #0066cc;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    color: #004999;
  }
`;

const ShareContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ShareText = styled.span`
  font-weight: 500;
`;

const SocialIcons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const SocialIcon = styled.a`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    background-color: #0066cc;
    color: white;
  }
`;

const BlogDetailHero = styled.div`
  height: 400px;
  width: 100%;
  background-image: ${props => `url(${props.imageUrl})`};
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  position: relative;
  margin-bottom: 2rem;
`;

const BlogDetailOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
  border-radius: 0 0 8px 8px;
`;

const BlogDetailCategory = styled.span`
  background-color: #0066cc;
  color: white;
  padding: 0.3rem 1rem;
  border-radius: 4px;
  text-transform: uppercase;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: inline-block;
`;

const BlogDetailTitle = styled.h1`
  font-size: 2.5rem;
  margin: 1rem 0;
  font-weight: 700;
`;

const BlogDetailMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-top: 1rem;
`;

const BlogDetailAuthor = styled.span`
  font-weight: 500;
`;

const BlogDetailDateWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const BlogDetailContent = styled.div`
  line-height: 1.8;
  font-size: 1.1rem;
  color: #333;
  
  h3 {
    font-size: 1.5rem;
    margin: 2rem 0 1rem;
    color: #111;
  }
  
  p {
    margin-bottom: 1.5rem;
  }
`;

const BlogDetailTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 2rem 0;
`;

const BlogDetailTag = styled.span`
  background-color: #f0f0f0;
  padding: 0.3rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #555;
`;

const BlogDetailFooter = styled.div`
  margin-top: 3rem;
  border-top: 1px solid #eaeaea;
  padding-top: 2rem;
`;

const RelatedArticlesTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
`;

const RelatedArticlesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const RelatedArticleCard = styled.div`
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const RelatedArticleImage = styled.div`
  height: 200px;
  background-image: ${props => `url(${props.imageUrl})`};
  background-size: cover;
  background-position: center;
  position: relative;
`;

const RelatedArticleDate = styled.span`
  position: absolute;
  bottom: 10px;
  left: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.2rem 0.8rem;
  border-radius: 4px;
  font-size: 0.8rem;
`;

const RelatedArticleTitle = styled.h4`
  padding: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
`;

const CommentsSection = styled.div`
  margin-top: 3rem;
  border-top: 1px solid #eaeaea;
  padding-top: 2rem;
`;

const CommentsTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
`;

const CommentCard = styled.div`
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
`;

const CommentText = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const ReplyButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #0066cc;
  font-weight: 500;
  cursor: pointer;
  margin-top: 0.5rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ReplyCard = styled.div`
  background-color: #fff;
  border-left: 3px solid #0066cc;
  padding: 1rem;
  margin: 0.8rem 0 0.8rem 1.5rem;
`;

const ReplyText = styled.p`
  font-size: 0.95rem;
  line-height: 1.5;
`;

const CommentForm = styled.form`
  margin-top: 2rem;
  background-color: #f0f0f0;
  padding: 1.5rem;
  border-radius: 8px;
`;

const CommentInput = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-family: inherit;
  resize: vertical;
`;

const SubmitButton = styled.button`
  background-color: #0066cc;
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #004999;
  }
`;

const ReplyForm = styled.form`
  margin: 1rem 0 1rem 1.5rem;
  padding: 1rem;
  background-color: #f0f0f0;
  border-radius: 4px;
`;

const ReplyInput = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-family: inherit;
  resize: vertical;
`;
const LoadMoreContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
`;

const LoadMoreButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #0066cc;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.8rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #004999;
  }
`;