export function Cards(props) {
    return (
        <div className="bg-white rounded-2xl shadow-lg flex flex-col items-center p-6 transition hover:scale-105 cursor-pointer" 
        onClick={props.onClick}
        >
            <img src={props.img} alt={props.label} className="w-32 h-32 object-contain mb-4" />
            <span className="text-orange-500 font-bold text-xl">{props.label}</span>
        </div>
    );
}