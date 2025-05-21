import React from 'react';
import './style.css';

interface RouteResponseProps {
  picUrl: string;
  alt?: string;
  text?: string;
  downloadUrl?: string;
}

const RouteResponse: React.FC<RouteResponseProps> = ({ 
  picUrl, 
  alt = '路线图', 
  text, 
  downloadUrl 
}) => {
  // 处理图片下载
  const handleImageDownload = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `路线图_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="route-response">
      <div className="route-image-container">
        <img 
          src={picUrl} 
          alt={alt} 
          className="route-image" 
        />
      </div>
      
      {text && (
        <div className="route-text">
          {text}
        </div>
      )}
      
      {downloadUrl && (
        <div className="route-download">
          <button 
            className="download-button"
            onClick={() => handleImageDownload(downloadUrl)}
          >
            <div className="download-button-content">
              <img 
                src="/icons/download.svg" 
                alt="下载" 
                className="download-icon" 
              />
              <span>下载路线图</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default RouteResponse; 