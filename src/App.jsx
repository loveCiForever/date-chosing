import React, { useState, useEffect, useRef } from "react";
import Swal from 'sweetalert2';

import { format } from "date-fns";

// MUI Time Picker
import { LocalizationProvider, StaticTimePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import ReactDOM from 'react-dom/client';

// Firebase Config
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, set, get, onValue, update } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCwczS0581iWd_ZM-mhjPH_8Hn2aTAW_m8",
  authDomain: "vungtautrip-9bc2e.firebaseapp.com",
  databaseURL: "https://vungtautrip-9bc2e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "vungtautrip-9bc2e",
  storageBucket: "vungtautrip-9bc2e.firebasestorage.app",
  messagingSenderId: "668112203929",
  appId: "1:668112203929:web:74a4471481c14df3c54808",
  measurementId: "G-Y6MHXM3D93"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);
// End Firebase Config

const App = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [transformedData, setTransformedData] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [confirmedDate, setConfirmedDate] = useState(null);
  const [name, setName] = useState("");
  const [dateChoices, setDateChoices] = useState([]);
  const [hoveredDate, setHoveredDate] = useState(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    Swal.fire({
      title: "Nhập tên đi mấy iem",
      text: "Sau khi nhập tên thì có em có thể chọn nhiều ngày nhé. Sau khi F5 reload trang thì phải điền lại chính xác tên lần trước nhen",
      input: "text",
      inputAttributes: {
        autocapitalize: "off"
      },
      showCancelButton: false,
      confirmButtonText: "Ok",
      showLoaderOnConfirm: true,
      allowOutsideClick: false,
      allowEscapeKey: false,
      preConfirm: (login) => {
        if (!login) {
          Swal.showValidationMessage("Dume may điền tên vào");
          return false;
        }
        localStorage.setItem("currentUser", login);
      }
    });
  }, [])

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
    // Firebase
    const fetchData = async () => {
      const dbRef = ref(database, `users/`);
      try {
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const formattedChoices = Object.entries(data).reduce((acc, [name, { dates }]) => {
            dates.forEach(({ date }) => {
              const dateObj = acc.find(d => d.date === date);
              if (dateObj) {
                if (!dateObj.people.includes(name)) {
                  dateObj.people.push(name);
                }
              } else {
                acc.push({ date, people: [name] });
              }
            });
            return acc;
          }, []);
          const tmp = Object.entries(data).map(([name, data]) => ({
            name,
            dates: data
          }));
          setDateChoices(formattedChoices);
          setTransformedData(tmp);
        }
      } catch (error) {
        console.error("Error fetching data from Firebase:", error);
      }
    };
    fetchData();
  }, []);

  const handleDateSelect = (date) => {
    Swal.fire({
      title: 'Rảnh từ giờ nào em?',
      allowOutsideClick: false,
      allowEscapeKey: false,
      html: `
        <div id="time-picker-container" style="display: flex; justify-content: center; align-items: center;"></div>
      `,
      showConfirmButton: false,
      didOpen: () => {
        const container = document.getElementById('time-picker-container');
        if (container) {
          const root = ReactDOM.createRoot(container);
          root.render(
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <StaticTimePicker
                label="Rảnh giờ nào em?"
                onAccept={(time) => {
                  setSelectedTime(time);
                  setSelectedDate(date);
                  Swal.close();
                }}
              />
            </LocalizationProvider>
          );
        }
      },
    });
  };

  useEffect(() => {
    if (selectedDate && selectedTime) {
      const currentUser = localStorage.getItem("currentUser");
      const timeKey = selectedTime.format("HH:mm");
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
      
      // Firebase write operation
      const writeUserData = async () => {
        const db = getDatabase();
        const userRef = ref(db, `users/${currentUser}/dates`);
        const snapshot = await get(userRef);
        let existingDates = [];
  
        if (snapshot.exists()) {
          existingDates = snapshot.val();
        }
        const updatedDates = Array.isArray(existingDates)
          ? existingDates.some(entry => entry.date === dateKey && entry.time === timeKey)
            ? existingDates
            : [...existingDates, { date: dateKey, time: timeKey }]
          : [{ date: dateKey, time: timeKey }];
        const tmp = [];
        tmp.push({
          name: currentUser,
          dates: {dates: updatedDates}
        })
        setTransformedData(tmp);
        set(userRef, updatedDates);
      }
      writeUserData();
    }
  }, [selectedDate, selectedTime])

  const getPeopleForDate = (date) => {
    const dateKey = format(date, "dd-MM-yyyy");
    const choice = dateChoices.find(c => c.date === dateKey);
    console.log(choice);
    return choice ? choice.people : [];
  };

  const generateCalendar = () => {
    const year = 2024;
    const month = 11; // index start from 0
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const topThreeDates = getTopThreeDates();

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<td key={`empty-${i}`} className="p-2"></td>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = format(date, "dd-MM-yyyy");
      const isTopDate = topThreeDates.includes(dateKey);

      days.push(
        <td key={day} className="p-2 text-center">
          <button
            onClick={() => handleDateSelect(date)}
            onMouseEnter={() => setHoveredDate(date)}
            onMouseLeave={() => setHoveredDate(null)}
            className={`sm:text-[16px] text-[14px] w-full h-full py-[6px] px-[6px] bg-red-200// rounded-lg ${isTopDate ? 'bg-green-300' : 'bg-red-000'} hover:bg-pink-200`}
          >
            {day}
          </button>
          {hoveredDate && hoveredDate.getTime() === date.getTime() && (
            <div className="absolute z-20 p-2 mt-1 bg-white border rounded shadow-md text-start">
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

  const parseDateTime = (date, time) => {
    const [day, month, year] = date.split('-');
    const [hours, minutes] = time.split(':');
    return new Date(year, month - 1, day, hours, minutes);
  };

  const renderChosenPeopleList = () => {
    return (
      <div className="">
        <h2 className="md:text-[18px] sm:text-[16px] text-[12px] font-bold mb-[10px] text-center">Những con tró đã chọn ngày</h2>
        <div className="h-[380px] overflow-y-auto">
          <ul className="list-container list-disc pl-7 ml-[-10px]">
            {transformedData.length === 0 ? (
              <li className="sm:text-[18px] text-[12px]">Chưa có ai tham gia</li>
            ) : (
              transformedData.map(({ name, dates }) => (
                <li key={name} className="sm:text-[18px] text-[12px] my-6">
                  <b className="font-semibold">{name}</b>
                  <br />
                  <ul>
                    {dates.dates
                      .sort((a, b) => {
                        const dateA = parseDateTime(a.date, a.time);
                        const dateB = parseDateTime(b.date, b.time);
                        return dateA - dateB; 
                      })
                      .map((item, index) => (
                        <li key={index}>
                          {item.date} từ {item.time}
                        </li>
                      ))}
                  </ul>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    );
  };

  const getTopThreeDates = () => {
    const dateCount = {};
    dateChoices.forEach(choice => {
      dateCount[choice.date] = choice.people.length;
    });

    const dateCountArray = Object.entries(dateCount);
    dateCountArray.sort((a, b) => b[1] - a[1]);
    return dateCountArray.slice(0, 6).map(([date]) => date);
  };

  return (
    // Container 1
    <div className="flex-col items-center justify-center min-h-screen p-8 lg:p-0 bg-pink-50">

      {/* Container 2 */}
      <div className="flex-row items-center justify-center min-h-screen lg:flex md:px-[200px]">
        {/* Container 3: left section */}
        <div className="bg-white p-8 rounded-2xl shadow-lg lg:max-w-[40%] md:max-w-[100%] w-[100%] sm:max-w-[100%] max-w-[100%] lg:mb-20 mb-5 sm:items-center sm:justify-center md:item-center md:justify-center">
          <h1 className="lg:text-3xl md:text-4xl sm:text-4xl text-[20px] font-bold mb-1 text-center text-gray-800">Vũng Tàu tháng 12</h1>
          <p className="lg:text-base md:text-xl sm:text-xl text-[14px] text-gray-500 sm:mb-6 mb-[1px] text-center">Lựa ngày các bé rảnh đi nhé</p>

          {/* Lịch thứ + ngày */}
          <table className="w-full border-collapse bg-blue-000">
            {/* Day */}
            <thead className="">
              <tr>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <th key={day} className="sm:text-[16px] text-[14px] py-0 flex-grow">{day}</th>
                ))}
              </tr>
            </thead>
            {/* Date */}
            <tbody>{generateCalendar()}</tbody>
          </table>

          <p className="mt-3 tracking-tighter text-center">Màu xanh là được nhiều người chọn nhé 💖</p>
          {/* Bảng lịch thứ + ngày */}
        </div>

        <div className="flex flex-col lg:max-w-[40%] w-[100%] sm:max-w-[100%] max-w-[100%] lg:ml-10 bg-white rounded-2xl shadow-lg lg:p-6 p-[15px] mb-20">
          {renderChosenPeopleList()}
        </div>
      </div>
      <div className="lg:pb-10">
        <h1 className="sm:text-xl text-[18px] font-semibold tracking-wider text-center">Một sản phẩm của DOM Corp</h1>
        <div className="mt-2 sm:text-xs text-[10px] font-normal tracking-wider text-center">
          Liên hệ:
          <a
            href="mailto:quanghuy71847@gmail.com"
            className="font-semibold"
          > Quang Huy (CEO + UI/UX Design + Solution Architect + Business Analyst + FrontEnd Developer)</a>&nbsp;

          <br />
          <a
            href="mailto:dtn06052005@gmail.com"
            className="font-semibold"
          > Truong Nguyen (CTO + Cloud Engineer + BackEnd Developer + Suc King + DataBase Administrator)</a>
        </div>
      </div>
    </div>
  );
};


export default App