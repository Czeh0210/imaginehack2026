import React from "react";
import { FileText } from "lucide-react";

export default function UserMessage({ content, file, onFileClick }) {
  return (
    <div className="user-msg-row">
      <div className="user-bubble-container">
        <div className="user-bubble">
          {file && (
            <div 
              className="user-file-card" 
              onClick={() => onFileClick?.(file)}
              title={`Click to preview ${file.name}`}
            >
              <FileText size={18} className="file-icon" />
              <div className="file-info">
                <span className="file-name">{file.name}</span>
                <span className="file-action">Click to preview</span>
              </div>
            </div>
          )}
          {content && <p className="user-text">{content}</p>}
        </div>
      </div>
      <div className="user-avatar">AD</div>

      <style jsx>{`
        .user-msg-row {
          display: flex;
          align-items: flex-start;
          justify-content: flex-end;
          gap: 12px;
          margin-bottom: 4px;
          width: 100%;
        }

        .user-bubble-container {
          max-width: 70%;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .user-bubble {
          background: #ddf4ff;
          border: 1px solid #54aeff;
          color: #032f62;
          padding: 12px 16px;
          border-radius: 16px;
          border-bottom-right-radius: 4px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .user-text {
          margin: 0;
          white-space: pre-wrap;
          font-size: 14.5px;
          line-height: 1.6;
        }

        .user-file-card {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #ffffff;
          border: 1px solid #d0d7de;
          border-radius: 8px;
          padding: 8px 12px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.15s ease-in-out;
        }

        .user-file-card:hover {
          border-color: #0969da;
          background: #f6f8fa;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
        }

        .file-icon {
          color: #0969da;
          flex-shrink: 0;
        }

        .file-info {
          display: flex;
          flex-direction: column;
          min-width: 120px;
          max-width: 260px;
        }

        .file-name {
          font-size: 12.5px;
          font-weight: 600;
          color: #24292f;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .file-action {
          font-size: 10.5px;
          color: #0969da;
          font-weight: 500;
          margin-top: 1px;
        }

        .user-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #0969da;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 600;
          border: 1.5px solid #54aeff;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}
