import { Botao } from "./Botao";
import { Input } from "./Input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export function LoginForm() {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const navigate = useNavigate();

    async function handleSubmit(event){
        event.preventDefault();
        try {
            const response = await axios.post("/auth/login", {
                email,
                senha
            });
            console.log(response.data);
            navigate("/menu");
        } catch (error) {
            if (error.response) {
                alert(error.response.data);
            } else {
                alert("Erro ao realizar login. Tente novamente mais tarde.");
            }
        }
    }

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-[url('/public/fundo-form.jpg')] bg-cover bg-center">
            <div className="absolute inset-0 bg-black/70"></div>
            <form onSubmit={handleSubmit} 
                className="relative flex flex-col justify-center items-center w-5/6 max-w-2xl p-10 rounded-3xl bg-orange/20 backdrop-blur-md shadow-lg">
                <div className="w-full flex flex-col gap-4">

                    <h2 className="text-4xl font-bold text-left text-white mb-2">Login</h2>
                    <h3 className="text-lg text-left text-white mb-6 font-normal">
                        Seja bem vindo novamente,<br />
                        Realize o login em sua conta!
                    </h3>

                    <label className="text-white text-sm text-left" htmlFor="email">Email</label>
                    <Input onChange={e => setEmail(e.target.value)}
                        id="email" placeholder="Email" type="email"
                        className="w-full bg-orange-100/80 rounded-xl px-4 py-3 text-base" />

                    <label className="text-white text-sm text-left" htmlFor="senha">Senha</label>
                    <Input onChange={e => setSenha(e.target.value)}
                        id="senha" placeholder="Senha" type="password"
                        className="w-full bg-orange-100/80 rounded-xl px-4 py-3 text-base" />

                    <div className="flex justify-between items-center mb-4">
                        <span></span>
                        <a href="#" className="text-right text-sm text-white hover:underline">Esqueci minha senha</a>
                    </div>

                    <Botao cor="laranja" texto="Entrar" type="submit" tamanho="w-full px-3 py-3 text-2xl" />

                    <div className="mt-6 text-center">
                        <span className="text-white text-sm">Ainda não possui uma conta? <a href="./register" className="font-bold underline">Cadastre-se</a></span>
                    </div>
                </div>
            </form>
        </div>
    );
}