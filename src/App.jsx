import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import Wave from 'react-wavify';

const App = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [confirmedDate, setConfirmedDate] = useState(null);
  const [name, setName] = useState("");
  const [dateChoices, setDateChoices] = useState([]);

  useEffect(() => {
    const storedChoices = localStorage.getItem("tripChoices");
    if (storedChoices) {
      setDateChoices(JSON.parse(storedChoices));
    }
  }, []);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setIsDialogOpen(true);
  };

  const handleConfirm = () => {
    if (selectedDate && name) {
      const dateKey = format(selectedDate, "dd-MM-yyyy");
      const updatedChoices = [...dateChoices];
      const existingChoice = updatedChoices.find(choice => choice.date === dateKey);

      if (existingChoice) {
        if (!existingChoice.people.includes(name)) {
          existingChoice.people.push(name);
        }
      } else {
        updatedChoices.push({ date: dateKey, people: [name] });
      }

      setDateChoices(updatedChoices);
      localStorage.setItem("tripChoices", JSON.stringify(updatedChoices));
      setConfirmedDate(selectedDate);
      setIsDialogOpen(false);
      setName("");
    }
  };

  const getPeopleForDate = (date) => {
    const dateKey = format(date, "dd-MM-yyyy");
    const choice = dateChoices.find(c => c.date === dateKey);
    return choice ? choice.people : [];
  };

  const generateCalendar = () => {
    const year = 2024;
    const month = 11;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<td key={`empty-${i}`} className="p-2"></td>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push(
        <td key={day} className="p-2 text-center">
          <button
            onClick={() => handleDateSelect(date)}
            className="w-full h-full py-[6px] bg-red-000 rounded-lg hover:bg-gray-300 hover"
          >
            {day}
          </button>
        </td>
      );
    }

    const totalCells = days.length;
    const remainingCells = 7 - (totalCells % 7);
    for (let i = 0; i < remainingCells; i++) {
      days.push(<td key={`remaining-${i}`} className="p-2"></td>);
    }

    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(<tr key={i}>{days.slice(i, i + 7)}</tr>);
    }

    return weeks;
  };

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-lg max-w-md w-full mb-20">
        <h1 className="text-3xl font-bold mb-2 text-center text-gray-800">Vũng Tàu - Here we go</h1>
        <p className="text-lg text-gray-500 mb-6 text-center">Lựa ngày các bé rảnh đi nhé </p>
        <table className="w-full border-collapse bg-blue-000">

          {/* Day */}
          <thead className="bg-red-000">
            <tr>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <th key={day} className="py-2 flex-grow">{day}</th>
              ))}
            </tr>
          </thead>

          {/* Date */}
          <tbody>{generateCalendar()}</tbody>

        </table>
        {confirmedDate && (
          <div className="mt-4 text-center">
            <p className="text-green-600">
              You've confirmed: {format(confirmedDate, "MMMM d, yyyy")}
            </p>
          </div>
        )}
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 pb-20 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-center">Chắc chắn đi không vậy mẹ</h2>
            <p className="mb-10 text-sm text-center">
              {selectedDate
                ? `Bạn đã chọn ngày: ${format(selectedDate, "MMMM d, yyyy")}`
                : "Lựa 1 ngày đi nhá"}
            </p>
            {selectedDate && (
              <>
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Có những ai chọn ngày này vậy ha</h3>
                  <div className="min-h-20 overflow-y-auto border p-2 rounded">
                    <ul>
                      {getPeopleForDate(selectedDate).map((person, index) => (
                        <li key={index}>{person}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="name"
                    className="block mb-2 mt-6">Mày không phải cha</label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Nên điền tên đầy đủ nhé "
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleConfirm}
                    disabled={!name}
                    className="px-4 py-2 bg-pink-400 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
                  >
                    Xác nhận không đi làm tró
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {!isDialogOpen && (
        <div className="">
          <svg width="0" height="0">
            <defs>
              <linearGradient id="seaGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                {/* mint blue */}
                <stop offset="0%" style={{ stopColor: '#5fc1ef', stopOpacity: 1 }} />
                {/* light blue */}
                <stop offset="100%" style={{ stopColor: '#40a6d7', stopOpacity: 1 }} />
              </linearGradient>
              <linearGradient id="seaGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                {/* light blue */}
                <stop offset="0%" style={{ stopColor: '#ecf2f5', stopOpacity: 1 }} />
                {/* dark blue */}
                <stop offset="100%" style={{ stopColor: '#C0DCE7', stopOpacity: 1 }} />
              </linearGradient>
              <linearGradient id="seaGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                {/* dark blue */}
                <stop offset="0%" style={{ stopColor: '#4682b4', stopOpacity: 1 }} />
                {/* near cyan */}
                <stop offset="100%" style={{ stopColor: '#5f9ea0', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
          </svg>

          {/* highest wave */}
          <Wave
            fill="url(#seaGradient1)"
            paused={false}
            style={{ display: 'flex', position: 'absolute', bottom: 10, left: 0, right: 0 }}
            options={{
              height: 0,
              amplitude: 50,
              speed: 0.15,
              points: 3
            }}
          />

          {/* second highest wave */}
          <Wave
            fill="url(#seaGradient2)"
            paused={false}
            style={{ display: 'flex', position: 'absolute', bottom: 0, left: 0, right: 0 }} // Slightly higher
            options={{
              height: 45, 
              amplitude: 40,
              speed: 0.2,
              points: 3
            }}
          />

          {/* third highest wave */}                                                             
          <Wave
            fill="url(#seaGradient3)"
            paused={false}
            style={{ display: 'flex', position: 'absolute', bottom: 0, left: 0, right: 0 }} // Slightly higher
            options={{
              height: 80,
              amplitude: 30,
              speed: 0.25,
              points: 3
            }}
          />
        </div>
      )}



    </div>

  );
};


export default App
