import React, { useState } from 'react';
import './style.css';

// 文档引用类型
interface DocReference {
  id: string;
  title: string;
  path: string;
  excerpt: string;
  confidence: number; // 置信度，0-100
}

// 组件属性类型
interface MaintenanceResponseProps {
  answer: string;
  references: DocReference[];
}

const MaintenanceResponse: React.FC<MaintenanceResponseProps> = ({ 
  answer, 
  references 
}) => {
  const [expandedDocs, setExpandedDocs] = useState<Record<string, boolean>>({});
  
  // 切换文档展开/折叠状态
  const toggleDoc = (docId: string) => {
    setExpandedDocs(prev => ({
      ...prev,
      [docId]: !prev[docId]
    }));
  };
  
  // 计算置信度颜色
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return '#4caf50'; // 高置信度，绿色
    if (confidence >= 70) return '#ffc107'; // 中等置信度，黄色
    return '#ff5722'; // 低置信度，红色
  };
  
  return (
    <div className="maintenance-response">
      {/* 回答内容 */}
      <div className="answer-container">
        <div className="answer-content">{answer}</div>
      </div>
      
      {/* 文档引用 */}
      {references.length > 0 && (
        <div className="references-container">
          <div className="references-title">参考文档</div>
          <div className="references-list">
            {references.map((doc) => (
              <div key={doc.id} className="reference-item">
                <div className="reference-header" onClick={() => toggleDoc(doc.id)}>
                  <div className="reference-title">
                    <i className={`icon ${expandedDocs[doc.id] ? 'icon-chevron-down' : 'icon-chevron-right'}`}></i>
                    {doc.title}
                  </div>
                  <div 
                    className="reference-confidence" 
                    style={{ color: getConfidenceColor(doc.confidence) }}
                  >
                    置信度: {doc.confidence}%
                  </div>
                </div>
                
                {expandedDocs[doc.id] && (
                  <div className="reference-details">
                    <div className="reference-path">
                      <span className="path-label">路径:</span> 
                      <span className="path-value">{doc.path}</span>
                    </div>
                    <div className="reference-excerpt">
                      {doc.excerpt}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceResponse; 