import React from 'react';
import Modal from './Modal';

interface ControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ControlsModal: React.FC<ControlsModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Game Controls">
      <div className="controls-content">
        <p className="controls-subtitle">All the controls you need to play Dice Risk</p>
        
        <div className="controller-diagram">
          <div className="controller-outline">
            {/* Left Side Controls */}
            <div className="control-group left">
              <div className="control-item">
                <div className="control-button"></div>
                <span className="control-arrow">←</span>
                <span className="control-label">Navigation</span>
              </div>
              <div className="control-item">
                <div className="control-button square"></div>
                <span className="control-arrow">←</span>
                <span className="control-label">Start Menu</span>
              </div>
            </div>

            {/* Right Side Controls */}
            <div className="control-group right">
              <div className="control-item">
                <div className="control-button diamond"></div>
                <span className="control-arrow">→</span>
                <span className="control-label">Double Bet</span>
              </div>
              <div className="control-item">
                <div className="control-button diamond"></div>
                <span className="control-arrow">→</span>
                <span className="control-label">Opponent Reveal</span>
              </div>
              <div className="control-item">
                <div className="control-button diamond"></div>
                <span className="control-arrow">→</span>
                <span className="control-label">Cancel</span>
              </div>
              <div className="control-item">
                <div className="control-button diamond"></div>
                <span className="control-arrow">→</span>
                <span className="control-label">Roll Dice</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ControlsModal;
