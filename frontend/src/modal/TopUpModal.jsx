import { useEffect, useState } from "react";
import "./TopUpModal.css";

/**
 * Модальное окно пополнения карты.
 * open — показывать/скрывать; onClose — закрыть; onTopUp(amount) — пополнить (Promise);
 * модалка закрывается после успешного onTopUp. loading — блокировать кнопку.
 */
export default function TopUpModal({ open, onClose, onTopUp, loading = false }) {
  const [value, setValue] = useState("");

  // При открытии сбрасываем поле суммы
  useEffect(() => {
    if (open) setValue("");
  }, [open]);

  // Закрытие по Escape
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const amount = Number(value);
  const canSubmit = value.trim() !== "" && Number.isFinite(amount) && amount > 0 && !loading;

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    await onTopUp(amount);
    onClose(); // ✅ закрываем модалку после клика “Пополнить”
  };

  return (
    <div className="modal-root">
      <button className="modal-overlay" type="button" onClick={onClose} aria-label="Close modal" />

      <div className="modal-card" role="dialog" aria-modal="true">
        <div className="modal-head">
          <div>
            <div className="modal-title">Пополнить</div>
            <div className="modal-subtitle">Введите сумму</div>
          </div>

          <button className="modal-close" type="button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <form className="modal-form" onSubmit={submit}>
          <label className="modal-label">Сумма</label>

          <div className="modal-inputWrap">
            <input
              className="modal-input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              inputMode="numeric"
              placeholder="Например: 100"
            />
            <span className="modal-currency">₽</span>
          </div>

          <button className="modal-btn" type="submit" disabled={!canSubmit}>
            {loading ? "Пополняем…" : "Пополнить"}
          </button>
        </form>
      </div>
    </div>
  );
}
