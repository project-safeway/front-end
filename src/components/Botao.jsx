export function Botao(props) {
    
    let corClasse = props.cor === "laranja" ? "bg-orange" : "bg-blue";

    return (
        <button
            className={`${corClasse} ${props.tamanho} text-white rounded-2xl`}
            type={props.type}
            onClick={props.onClick}
        >
            {props.texto}
        </button>
    );
}
