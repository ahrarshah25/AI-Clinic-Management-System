const STYLE_ID = "clinic-swal-styles";

const ICONS = {
  success: { symbol: "✓", color: "#16a34a", bg: "#dcfce7" },
  error: { symbol: "!", color: "#dc2626", bg: "#fee2e2" },
  warning: { symbol: "!", color: "#ca8a04", bg: "#fef9c3" },
  info: { symbol: "i", color: "#2563eb", bg: "#dbeafe" },
  question: { symbol: "?", color: "#7c3aed", bg: "#ede9fe" },
};

const ensureStyles = () => {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .clinic-swal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.55);
      backdrop-filter: blur(4px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      animation: clinic-swal-fade 0.2s ease-out;
    }
    .clinic-swal-card {
      width: 100%;
      max-width: 420px;
      border-radius: 16px;
      background: #ffffff;
      padding: 24px;
      box-shadow: 0 24px 60px rgba(15, 23, 42, 0.25);
      transform: translateY(0);
      animation: clinic-swal-pop 0.2s ease-out;
      font-family: "Inter", sans-serif;
    }
    .clinic-swal-icon {
      width: 52px;
      height: 52px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 14px;
    }
    .clinic-swal-title {
      margin: 0;
      font-size: 22px;
      font-weight: 700;
      color: #0f172a;
    }
    .clinic-swal-text {
      margin: 10px 0 0;
      font-size: 14px;
      line-height: 1.5;
      color: #334155;
      white-space: pre-wrap;
    }
    .clinic-swal-actions {
      margin-top: 20px;
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }
    .clinic-swal-btn {
      border: 0;
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .clinic-swal-btn:active { transform: scale(0.98); }
    .clinic-swal-confirm {
      background: linear-gradient(135deg, #2563eb, #7c3aed);
      color: #fff;
    }
    .clinic-swal-cancel {
      background: #f1f5f9;
      color: #0f172a;
    }
    @keyframes clinic-swal-fade {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes clinic-swal-pop {
      from { opacity: 0; transform: translateY(8px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
  `;

  document.head.appendChild(style);
};

const buildButton = (label, className, onClick) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `clinic-swal-btn ${className}`;
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
};

const removeElement = (element) => {
  if (element?.parentNode) {
    element.parentNode.removeChild(element);
  }
};

const fire = ({
  title = "",
  text = "",
  icon = "info",
  confirmButtonText = "OK",
  cancelButtonText = "Cancel",
  showCancelButton = false,
  allowOutsideClick = true,
} = {}) => {
  if (typeof document === "undefined") {
    return Promise.resolve({ isConfirmed: true, isDismissed: false });
  }

  ensureStyles();

  return new Promise((resolve) => {
    const iconConfig = ICONS[icon] || ICONS.info;
    const overlay = document.createElement("div");
    overlay.className = "clinic-swal-overlay";

    const card = document.createElement("div");
    card.className = "clinic-swal-card";

    const iconNode = document.createElement("div");
    iconNode.className = "clinic-swal-icon";
    iconNode.style.color = iconConfig.color;
    iconNode.style.background = iconConfig.bg;
    iconNode.textContent = iconConfig.symbol;

    const titleNode = document.createElement("h3");
    titleNode.className = "clinic-swal-title";
    titleNode.textContent = title || "Alert";

    const textNode = document.createElement("p");
    textNode.className = "clinic-swal-text";
    textNode.textContent = text || "";

    const actions = document.createElement("div");
    actions.className = "clinic-swal-actions";

    const closeWith = (result) => {
      document.removeEventListener("keydown", onEsc);
      removeElement(overlay);
      resolve(result);
    };

    const onEsc = (event) => {
      if (event.key === "Escape") {
        closeWith({ isConfirmed: false, isDismissed: true });
      }
    };

    document.addEventListener("keydown", onEsc);

    if (showCancelButton) {
      actions.appendChild(
        buildButton(cancelButtonText, "clinic-swal-cancel", () =>
          closeWith({ isConfirmed: false, isDismissed: true })
        )
      );
    }

    actions.appendChild(
      buildButton(confirmButtonText, "clinic-swal-confirm", () =>
        closeWith({ isConfirmed: true, isDismissed: false })
      )
    );

    if (allowOutsideClick) {
      overlay.addEventListener("click", (event) => {
        if (event.target === overlay) {
          closeWith({ isConfirmed: false, isDismissed: true });
        }
      });
    }

    card.append(iconNode, titleNode, textNode, actions);
    overlay.appendChild(card);
    document.body.appendChild(overlay);
  });
};

const success = (title, text, options = {}) =>
  fire({ icon: "success", title, text, ...options });
const error = (title, text, options = {}) =>
  fire({ icon: "error", title, text, ...options });
const info = (title, text, options = {}) =>
  fire({ icon: "info", title, text, ...options });
const warning = (title, text, options = {}) =>
  fire({ icon: "warning", title, text, ...options });
const confirm = (title, text, options = {}) =>
  fire({ icon: "question", title, text, showCancelButton: true, ...options });

const Swal = {
  fire,
  success,
  error,
  info,
  warning,
  confirm,
};

export default Swal;
