"use client";

import React from "react";

type Option = {
  label: string;
  value: string;
};

type Field = {
  label: string;
  type?: "text" | "number" | "email" | "password" | "select" | "textarea";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  options?: Option[];
};

type Props = {
  title: string;
  fields: Field[];
  loading: boolean;
  onClose: () => void;
  onSubmit: () => void;
  editMode?: boolean;
  modalId?: string;
};

const CustomModal = ({
  title,
  fields,
  loading,
  onClose,
  onSubmit,
  editMode,
  modalId = "custom_modal",
}: Props) => {
  return (
    <dialog id={modalId} className="modal">
      <div className="modal-box">
        {/* Bouton fermer */}
        <form method="dialog">
          <button
            type="button"
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={onClose}
          >
            ✕
          </button>
        </form>

        <h3 className="font-bold text-lg mb-4">{title}</h3>

        {/* 🔥 FORM IMPORTANT */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          {fields.map((field, index) => {
            const commonProps = {
              value: field.value,
              onChange: (e: any) => field.onChange(e.target.value),
              required: field.required,
              className: "w-full mb-4",
            };

            // 🔽 SELECT
            if (field.type === "select") {
              return (
                <select
                  key={index}
                  {...commonProps}
                  className="select select-bordered w-full mb-4"
                >
                  <option value="">Choisir {field.label}</option>
                  {field.options?.map((opt, i) => (
                    <option key={i} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              );
            }

            // 🔽 TEXTAREA
            if (field.type === "textarea") {
              return (
                <textarea
                  key={index}
                  placeholder={field.placeholder || field.label}
                  {...commonProps}
                  className="textarea textarea-bordered w-full mb-4"
                />
              );
            }

            // 🔽 INPUT (par défaut)
            return (
              <input
                key={index}
                type={field.type || "text"}
                placeholder={field.placeholder || field.label}
                {...commonProps}
                className="input input-bordered w-full mb-4"
              />
            );
          })}

          {/* 🔥 BOUTON */}
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading
              ? "Enregistrement..."
              : editMode
                ? "Modifier"
                : "Enregistrer"}
          </button>
        </form>
      </div>
    </dialog>
  );
};

export default CustomModal;
