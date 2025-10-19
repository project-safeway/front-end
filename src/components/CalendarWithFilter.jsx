import React, { useState } from "react";
import { Calendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function CalendarWithFilter() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filter, setFilter] = useState("todos");

  const eventos = [
    { date: new Date(2025, 9, 20), title: "Manutenção preventiva do ônibus", type: "manutencao" },
    { date: new Date(2025, 9, 22), title: "Reunião com pais - Rota 3", type: "reuniao" },
    { date: new Date(2025, 9, 25), title: "Vencimento: Seguro dos veículos", type: "vencimento" },
    { date: new Date(2025, 9, 28), title: "Treinamento de motoristas", type: "treinamento" },
  ];

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const eventosDoDia = eventos.filter(
    (evento) => evento.date.toDateString() === selectedDate.toDateString()
  );

  const getEventColor = (type) => {
    const colors = {
      manutencao: "border-primary-400 bg-primary-50",
      reuniao: "border-navy-400 bg-navy-50",
      vencimento: "border-red-400 bg-red-50",
      treinamento: "border-green-400 bg-green-50",
    };
    return colors[type] || "border-gray-400 bg-gray-50";
  };

  return (
    <div className="bg-offwhite-50 border border-offwhite-200 rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-navy-900">Calendário de Eventos</h3>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-offwhite-300 rounded-lg text-sm text-navy-700 bg-white focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none"
        >
          <option value="todos">Todos</option>
          <option value="manutencao">Manutenção</option>
          <option value="reuniao">Reuniões</option>
          <option value="vencimento">Vencimentos</option>
          <option value="treinamento">Treinamentos</option>
        </select>
      </div>

      <div className="calendar-container mb-4">
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          locale="pt-BR"
          tileClassName={({ date }) => {
            const hasEvent = eventos.some(
              (e) => e.date.toDateString() === date.toDateString()
            );
            return hasEvent ? "has-event" : "";
          }}
        />
      </div>

      <div>
        <h4 className="font-semibold text-navy-800 mb-3">
          Eventos para {selectedDate.toLocaleDateString("pt-BR")}
        </h4>
        {eventosDoDia.length > 0 ? (
          <ul className="space-y-2">
            {eventosDoDia.map((evento, idx) => (
              <li
                key={idx}
                className={`p-3 rounded-lg border-l-4 ${getEventColor(evento.type)}`}
              >
                <span className="font-medium text-navy-900 block">{evento.title}</span>
                <span className="text-xs text-navy-600 capitalize">
                  {evento.type}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-navy-500 text-sm text-center py-4 bg-offwhite-100 rounded-lg">
            Nenhum evento agendado para este dia.
          </p>
        )}
      </div>
    </div>
  );
}
