import React from "react";
import { Botao } from "./Botao";

export function CadastroEmpresaForm(){

    return (
        <div>
            <h2>Cadastre sua empresa</h2>
            <form>
                <label>
                    Nome:
                    <input type="text" placeholder="Nome" name="nome"/>
                </label>
                <br />

                <label>
                    CNPJ:
                    <input type="text" placeholder="00.000.000/0001-00" name="cnpj" />
                </label>
                <br />

                <label>
                    Razão Social::
                    <input type="text" placeholder="Empresa Ltda" name="razaoSocial"/>
                </label>
                <br />

                <label>
                    Email:
                    <input type="email" placeholder="E-mail" name="email"/>
                </label>
                <br />

                <label>
                    Senha:
                    <input type="password" placeholder="Senha" name="senha"/>
                </label>
                <br />

                {/*============ ENDEREÇO ============= */}

                <label>
                    Rua:
                    <input type="text" placeholder="Rua" name="rua"/>
                </label>
                <br />

                <label>
                    Número:
                    <input type="text" placeholder="Número" name="numero"/>
                </label>
                <br />

                <label>
                    CEP:
                    <input type="text" placeholder="CEP" name="cep"/>
                </label>
                <br />

                <label>
                    Bairro:
                    <input type="text" placeholder="Bairro" name="bairro" />
                </label>
                <br />

                <label>
                    Telefone:
                    <input type="text" placeholder="Telefone" name="telefone"/>
                </label>
                <br />

                <Botao texto={Cadastrar} type="submit" />
            </form>
        </div>
    );
}
