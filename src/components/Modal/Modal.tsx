import React from 'react';
import { IoClose } from 'react-icons/io5';
import { IMAGES } from '../../constant/images';
import './modal.scss';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  variant?: 'default' | 'help';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, variant = 'default' }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className={`modal-content ${variant}`}>
        <img src={IMAGES.MODAL_FRAME} alt="Modal frame" className="modal-frame" />
        <img 
          src={IMAGES.CLOSE_BUTTON} 
          alt="Close" 
          className="modal-close-btn-img"
          onClick={onClose}
        />
        <div className="modal-inner-content">
          <div className="modal-header">
            <h2 className="modal-title">{title}</h2>
          </div>
          <div className="modal-body">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
