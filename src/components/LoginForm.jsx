import React from "react";
import { Botao } from "./Botao";

export function LoginForm(){
    
    return (
        <div>
            <h2>Login</h2>
            <form>
                <input type="email" placeholder="E-mail" />
                <br />
                <input type="password" placeholder="Senha" />
                <br />
                <Botao texto="Entrar" type="submit" />
            </form>
        </div>
    );
}