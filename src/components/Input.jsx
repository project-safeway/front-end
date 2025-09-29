export function Input(props) {
    return (
        <input 
            className={`bg-gray-100 rounded-xl text-base text-gray-700 outline-none border-none ${props.className}`}
            type={props.type} 
            placeholder={props.placeholder} 
            value={props.value}
            onChange={props.onChange}
        />
    );
}