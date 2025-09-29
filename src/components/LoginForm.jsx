import React from "react";
import { Botao } from "./Botao";

export function LoginForm() {

    return (
        <form className="flex flex-col items-center justify-center min-h-screen">
            <h2 className="text-4xl mb-8">Login</h2>
            <input className="w-1/2 bg-gray-100 rounded-xl px-4 py-4 text-base text-gray-700 outline-none border-none mb-4" 
            type="email" placeholder="E-mail" />
            
            <input className="w-1/2 bg-gray-100 rounded-xl px-4 py-4 text-base text-gray-700 outline-none border-none mb-4" type="password" placeholder="Senha" />
            <Botao cor="laranja" texto="Entrar" type="submit" tamanho="w-1/2 px-3 py-3 text-3xl" />
        </form>
    );
}