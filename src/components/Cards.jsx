import { useLocation, useNavigate } from "react-router-dom";

export function Cards(props) {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <div 
            className="bg-white max-h-45 rounded-2xl shadow-lg flex flex-col items-center p-2 transition hover:scale-102 cursor-pointer"
            onClick={() => navigate(`/${props.navegarPara}`)}
        >
            <img src={props.img} alt={props.label} className="w-32 h-32 object-contain" />
            <span className="text-orange-500 font-bold text-xl">{props.label}</span>
        </div>
    );
}