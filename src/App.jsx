import React, { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import Wave from 'react-wavify';

const App = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [confirmedDate, setConfirmedDate] = useState(null);
  const [name, setName] = useState("");
  const [dateChoices, setDateChoices] = useState([]);
  const [hoveredDate, setHoveredDate] = useState(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target)) {
        setIsDialogOpen(false);
      }
    };

    if (isDialogOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDialogOpen]);

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
            onMouseEnter={() => setHoveredDate(date)}
            onMouseLeave={() => setHoveredDate(null)}
            className="sm:text-[16px] text-[14px] w-full h-full py-[6px] bg-red-000 rounded-lg hover:bg-gray-300 hover"
          >
            {day}
          </button>
          {hoveredDate && hoveredDate.getTime() === date.getTime() && (
            <div className="absolute bg-white border rounded shadow-lg p-2 mt-1">
              <h4 className="font-semibold"></h4>
              <ul>
                {getPeopleForDate(hoveredDate).length === 0 ? (
                  <li>Chưa ai chọn cả</li>
                ) : (
                  getPeopleForDate(hoveredDate).map((person, index) => (
                    <li key={index}>{person}</li>
                  ))
                )}
              </ul>
            </div>
          )}
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

  const renderChosenPeopleList = () => {
    const peopleMap = {};

    // Create a map of people to their chosen dates
    dateChoices.forEach(choice => {
      choice.people.forEach(person => {
        if (!peopleMap[person]) {
          peopleMap[person] = [];
        }
        peopleMap[person].push(choice.date);
      });
    });

    return (
      <div className="mb-0">
        <h2 className="md:text-xl sm:text-[16px] text-[12px] font-bold mb-[10px] text-center">Những người đã chọn</h2>
        <ul className="list-disc sm:pl-5 pl-[10px]">
          {Object.entries(peopleMap).length === 0 ? (
            <li className="sm:text-[18px] text-[12px]">Chưa có ai tham gia</li>
          ) : (
            Object.entries(peopleMap).map(([person, dates]) => (
              <li key={person}>
                {person}: {dates.join(", ")}
              </li>
            ))
          )}
        </ul>
      </div>
    );
  };

  const handleClearStorage = () => {
    localStorage.removeItem("tripChoices");
    setDateChoices([]);
  }

  const getTopThreeDates = () => {
    const dateCount = {};

    dateChoices.forEach(choice => {
      dateCount[choice.date] = choice.people.length;
    });

    const dateCountArray = Object.entries(dateCount);
    dateCountArray.sort((a, b) => b[1] - a[1]);

    return dateCountArray.slice(0, 3);
  };

  return (
    <div className="min-h-screen bg-pink-50 lg:flex flex-row block items-center justify-center p-3">
      <div className="bg-white p-8 rounded-2xl shadow-lg lg:max-w-[30%] max-w-[100%] w-full lg:mb-20 mb-5">
        <h1 className="lg:text-3xl md:text-5xl sm:text-4xl text-[24px] font-bold mb-2 text-center text-gray-800">Vũng Tàu - Here we go</h1>
        <p className="lg:text-lg md:text-2xl sm:text-xl text-[14px] text-gray-500 sm:mb-6 mb-[10px] text-center">Lựa ngày các bé rảnh đi nhé </p>
        <table className="w-full border-collapse bg-blue-000">

          {/* Day */}
          <thead className="bg-red-000">
            <tr>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <th key={day} className="sm:text-[16px] text-[14px] py-2 flex-grow">{day}</th>
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
          <div
            ref={dialogRef}
            className="bg-white p-8 rounded-lg max-w-md w-full">
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


          <div className="">
            {/* highest wave */}
            {/* <Wave
              fill="url(#seaGradient1)"
              paused={false}
              style={{ display: 'flex', position: 'absolute', bottom: 10, left: 0, right: 0 }}
              options={{
                height: 2,
                amplitude: 50,
                speed: 0.15,
                points: 3
              }}
            /> */}

            {/* second highest wave */}
            {/* <Wave
              fill="url(#seaGradient2)"
              paused={false}
              style={{ display: 'flex', position: 'absolute', bottom: 0, left: 0, right: 0 }} // Slightly higher
              options={{
                height: 45,
                amplitude: 40,
                speed: 0.2,
                points: 3
              }}
            /> */}

            {/* third highest wave */}
            {/* <Wave
              fill="url(#seaGradient3)"
              paused={false}
              style={{ display: 'flex', position: 'absolute', bottom: 0, left: 0, right: 0 }} // Slightly higher
              options={{
                height: 80,
                amplitude: 30,
                speed: 0.25,
                points: 3
              }}
            /> */}
          </div>

        </div>
      )}

      <div className="flex flex-row lg:justify-start justify-between lg:w-[50%] w-[100%]">
        <div className="lg:ml-[50px] mb-20 min-h-[200px] w-[48%] bg-white bg-red-000 rounded-2xl shadow-lg lg:p-6 p-[15px]">
          <h2 className="md:text-xl sm:text-[16px] text-[12px] font-bold text-center mb-[10px]">3 ngày oke nhất</h2>
          <ul className="list-disc sm:pl-5 pl-[10px]">
            {getTopThreeDates().length === 0 ? (
              <li className="sm:text-[18px] text-[12px]">Chưa có ai tham gia</li>
            ) : (
              getTopThreeDates().map(([date, count]) => (
                <li key={date}>
                  {date}: {count} người đã chọn
                </li>
              ))
            )}
          </ul>
        </div>
        {/* <button
          onClick={handleClearStorage}
          className="px-4 py-2 bg-red-300 text-white rounded hover:bg-red-500"
        >
          Clear All Choices
        </button> */}
        <div className="flex flex-col lg:ml-[50px] bg-red-000 mb-20 min-h-[200px] w-[48%] bg-white bg-red-000 rounded-2xl shadow-lg lg:p-6 p-[15px]">
          {renderChosenPeopleList()}
        </div>
      </div>


    </div>
  );
};


export default App
