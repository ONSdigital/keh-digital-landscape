import { useNavigate } from 'react-router-dom';
import { MdOutlineArrowBackIosNew } from 'react-icons/md';

function BackButton({ previousPage, label = 'Back', ariaLabel = 'Back to previous page' }) {
  const navigate = useNavigate();

  return (
    <button
      className="copilot-back-button"
      onClick={() => navigate(previousPage)}
      aria-label={ariaLabel}
    >
      <MdOutlineArrowBackIosNew size={12} />
      <span id="back-button-text">{label}</span>
    </button>
  );
}

export default BackButton;
