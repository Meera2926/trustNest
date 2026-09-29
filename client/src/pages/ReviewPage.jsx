import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SharedPages.css';

const tags = ['Punctual', 'Professional', 'Friendly', 'Great value', 'Thorough', 'Would rebook'];

export default function ReviewPage() {
  const navigate = useNavigate();
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(['Punctual']);
  const [review, setReview] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const toggleTag = (tag) => {
    setSelected(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => navigate(-1), 1800);
  };

  return (
    <div className="sp-page">
      {/* Header */}
      <div className="sp-header">
        <button className="sp-back-btn" onClick={() => navigate(-1)}>‹</button>
        <h1 className="sp-header-title">Rate your service</h1>
      </div>
      <div className="sp-divider" />

      <div className="rv-body">
        {/* Worker info */}
        <div className="rv-worker-section">
          <img src="/worker_priya.png" alt="Priya Sharma" className="rv-avatar" />
          <h2 className="rv-worker-name">How was Priya Sharma?</h2>
          <p className="rv-worker-meta">Home Deep Cleaning · 12 Jul</p>
        </div>

        {/* Star Rating */}
        <div className="rv-stars">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              className={`rv-star ${star <= (hovered || rating) ? 'rv-star-filled' : ''}`}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(star)}
            >
              ★
            </button>
          ))}
        </div>

        {/* Tags */}
        <div className="rv-tags-section">
          <h3 className="rv-tags-label">What stood out?</h3>
          <div className="rv-tags">
            {tags.map(tag => (
              <button
                key={tag}
                className={`rv-tag ${selected.includes(tag) ? 'rv-tag-selected' : ''}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Text review */}
        <div className="rv-text-section">
          <h3 className="rv-tags-label">Write a review</h3>
          <div className="rv-divider" />
          <textarea
            className="rv-textarea"
            placeholder="Share your experience with Priya..."
            value={review}
            onChange={e => setReview(e.target.value)}
            rows={4}
          />
        </div>

        {/* Submit */}
        <button
          className={`rv-submit-btn ${submitted ? 'rv-submitted' : ''}`}
          onClick={handleSubmit}
          disabled={submitted}
        >
          {submitted ? '✓ Review submitted!' : 'Submit review'}
        </button>
      </div>
    </div>
  );
}
