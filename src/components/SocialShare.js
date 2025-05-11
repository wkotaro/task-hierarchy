import React from 'react';

const SocialShare = ({ title, description, projectTitle }) => {
  const shareUrl = window.location.href;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(projectTitle ? `${projectTitle}: ${title}` : title || 'タスク管理アプリ');
  const encodedDescription = encodeURIComponent(description || '私のタスク進捗状況を確認してください！');

  const shareOnTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
    window.open(twitterUrl, '_blank');
  };

  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    window.open(facebookUrl, '_blank');
  };

  const shareOnLine = () => {
    const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`;
    window.open(lineUrl, '_blank');
  };

  return (
    <div className="social-share">
      <h3>{projectTitle ? `「${projectTitle}」の進捗を共有` : '進捗状況をSNSで共有'}</h3>
      <div className="share-buttons">
        <button
          className="share-button twitter"
          onClick={shareOnTwitter}
          aria-label="Twitterで共有"
        >
          <i className="fab fa-twitter"></i>
          <span>Twitter</span>
        </button>
        <button
          className="share-button facebook"
          onClick={shareOnFacebook}
          aria-label="Facebookで共有"
        >
          <i className="fab fa-facebook-f"></i>
          <span>Facebook</span>
        </button>
        <button
          className="share-button line"
          onClick={shareOnLine}
          aria-label="LINEで共有"
        >
          <i className="fab fa-line"></i>
          <span>LINE</span>
        </button>
      </div>
    </div>
  );
};

export default SocialShare;
