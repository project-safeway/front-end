import React from "react";

export function Botao({ texto, onClick, type = "button"}) {
    return (
        <button type={type} onClick={onClick}>
            {texto}
        </button>
    );
} 
