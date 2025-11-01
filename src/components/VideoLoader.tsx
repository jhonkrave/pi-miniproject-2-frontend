/**
 * VideoLoader component for LumiFlix - Modern streaming-style loading animation
 * 
 * Provides a professional loading experience for video player initialization
 * 
 * @component
 * @returns {JSX.Element} The VideoLoader component with animated loading indicator
 * 
 * @since 1.0.0
 */
export default function VideoLoader() {
  return (
    <div className="video-loader">
      <div className="video-loader-content">
        <div className="video-loader-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <div className="video-loader-text">
          <span className="loading-text">Preparando el reproductor</span>
          <span className="loading-dots">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </span>
        </div>
      </div>
    </div>
  );
}



