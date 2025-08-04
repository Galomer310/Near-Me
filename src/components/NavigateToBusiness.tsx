import React from "react";

type NavigateToBusinessProps = {
  open: boolean;
  onClose: () => void;
  businessName: string;
  businessUrl?: string;
  text: {
    to: string;
    close: string;
    navigateToBusiness: string;
  };
};

const NavigateToBusiness: React.FC<NavigateToBusinessProps> = ({
  open,
  onClose,
  businessName,
  text,
}) => {
  if (!open) return null;

  return (
    <div className="business-modal-overlay">
      <div className="business-modal-content">
        <h3>{businessName}</h3>
        <p>{text.navigateToBusiness}</p>

        <div
          style={{
            display: "flex",
            gap: 16,
            justifyContent: "center",
            marginTop: 18,
          }}
        >
          <button
            style={{
              padding: "7px 22px",
              fontWeight: 600,
              background: "#f5f5f5",
              color: "#222",
              border: "1px solid #ccc",
              borderRadius: 7,
              cursor: "pointer",
            }}
            onClick={onClose}
          >
            {text.close}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NavigateToBusiness;
