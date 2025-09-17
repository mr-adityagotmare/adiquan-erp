"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

type Student = {
  id: number;
  name: string;
  course_id: number;
  status: string;
};

type Course = {
  id: number;
  name: string;
  status: "Active" | "Inactive";
};

type Teacher = {
  id: number;
  name: string;
  status: string;
};

type AttendanceRecord = {
  id: number;
  student_id: number;
  course_id: number;
  date: string;
  present: boolean;
  marked_by: string;
  timestamp: string;
};

export default function AttendancePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<{ [key: number]: boolean }>({});
  const [attendanceInfo, setAttendanceInfo] = useState<{ [key: number]: AttendanceRecord }>({});
  const [selectedCourse, setSelectedCourse] = useState<number | "">("");
  const [selectedTeacher, setSelectedTeacher] = useState<number | "">("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [successMsg, setSuccessMsg] = useState("");
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  // Fetch active courses
  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("status", "Active");
    if (error) return console.error("Error fetching courses:", error.message);
    setCourses(data || []);
  };

  // Fetch active teachers
  const fetchTeachers = async () => {
    setLoadingTeachers(true);
    const { data, error } = await supabase
      .from("teachers")
      .select("*")
      .eq("status", "Active");
    if (error) setTeachers([]);
    else setTeachers(data || []);
    setLoadingTeachers(false);
  };

  // Fetch students and their attendance
  const fetchAttendance = async (courseId: number, date: string) => {
    const { data: studentData, error: studentError } = await supabase
      .from("students")
      .select("*")
      .eq("course_id", courseId)
      .eq("status", "Active");
    if (studentError) return console.error("Error fetching students:", studentError.message);

    const { data: attendanceData, error: attendanceError } = await supabase
      .from("attendance")
      .select("*")
      .eq("course_id", courseId)
      .eq("date", date);
    if (attendanceError) return console.error("Error fetching attendance:", attendanceError.message);

    const map: { [key: number]: boolean } = {};
    const info: { [key: number]: AttendanceRecord } = {};

    (studentData || []).forEach((s: Student) => {
    const record = (attendanceData || []).find((a: AttendanceRecord) => a.student_id === s.id);
    map[s.id] = record ? record.present : false;
    if (record) info[s.id] = record;
    });

    setStudents(studentData || []);
    setAttendanceMap(map);
    setAttendanceInfo(info);
  };
// Single attendance toggle
const toggleAttendance = async (studentId: number) => {
  if (!selectedTeacher || !selectedCourse) return;

  const newValue = !attendanceMap[studentId];
  setAttendanceMap({ ...attendanceMap, [studentId]: newValue });

  const course = courses.find(c => c.id === selectedCourse);
  if (!course) return;

  const record = {
    student_id: studentId,
    course_id: selectedCourse,
    course: course.name,      // required because NOT NULL
    date: selectedDate,
    present: newValue,
    marked_by: selectedTeacher.toString(),
    timestamp: new Date().toISOString(),
  };

const { error } = await supabase
  .from("attendance")
  .upsert([record], {
    onConflict: "student_id,course_id,date", // <-- string, not array
    ignoreDuplicates: false,
  });


if (error) {
  console.error("Error saving attendance:", error.message);
//   alert(`Error saving attendance: ${error.message}`);
} else {
//   alert("Attendance saved ✅");
}


  if (error) console.error("Error saving attendance:", error.message);
  else fetchAttendance(selectedCourse, selectedDate);

  showSuccess("Attendance updated");
};


  // Toggle all attendance
// Batch attendance toggle
const toggleAll = async (present: boolean) => {
  if (!selectedTeacher || !selectedCourse) return;

  const course = courses.find(c => c.id === selectedCourse);
  if (!course) return;

  const records = students.map(s => ({
    student_id: s.id,
    course_id: selectedCourse,
    course: course.name,
    date: selectedDate,
    present,
    marked_by: selectedTeacher.toString(),
    timestamp: new Date().toISOString(),
  }));

//   const { error } = await supabase.from("attendance").upsert(records, {
//     onConflict: ["student_id", "course_id", "date"],
//     ignoreDuplicates: false,
//   });

  const { error } = await supabase
  .from("attendance")
  .upsert([records], {
    onConflict: "student_id,course_id,date", // <-- string, not array
    ignoreDuplicates: false,
  });


  if (error) console.error("Error saving batch attendance:", error.message);
  else fetchAttendance(selectedCourse, selectedDate);

  setAttendanceMap(
    students.reduce((acc, s) => ({ ...acc, [s.id]: present }), {})
  );
  showSuccess(present ? "All marked present" : "All marked absent");
};



  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 2000);
  };

  const allPresent = students.length > 0 && students.every(s => attendanceMap[s.id]);

  useEffect(() => {
    fetchCourses();
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (selectedCourse) fetchAttendance(selectedCourse, selectedDate);
    else setStudents([]);
  }, [selectedCourse, selectedDate]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-2">Attendance</h1>
      <p className="text-gray-600 mb-6">Toggle student attendance</p>

      <div className="flex gap-4 items-center mb-6">
        {/* Courses dropdown */}
        <select
          className="border px-3 py-2 rounded"
          value={selectedCourse}
          onChange={e => setSelectedCourse(Number(e.target.value))}
        >
          <option value="">Select Course</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Date picker */}
        <input
          type="date"
          className="border px-3 py-2 rounded"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
        />

        {/* Teacher dropdown */}
        <select
          className="border px-3 py-2 rounded"
          value={selectedTeacher}
          onChange={e => setSelectedTeacher(Number(e.target.value))}
          disabled={teachers.length === 0 || loadingTeachers}
        >
          <option value="">Select Teacher</option>
          {teachers.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        {/* Present All checkbox */}
        {students.length > 0 && (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={allPresent}
              onChange={e => toggleAll(e.target.checked)}
              disabled={!selectedTeacher}
            />
            Present All
          </label>
        )}
      </div>

      {/* Students table */}
      {students.length > 0 && (
        <div className="overflow-x-auto bg-white rounded shadow p-4 mb-6">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4 text-left">Student Name</th>
                <th className="py-2 px-4 text-left">Attendance</th>
              </tr>
            </thead>
            <tbody>
{students.map(s => {
  const record = attendanceInfo[s.id];
  const teacherName = record
    ? teachers.find(t => t.id.toString() === record.marked_by)?.name || record.marked_by
    : "";

  return (
    <tr key={s.id} className="border-b hover:bg-gray-50">
      <td className="py-2 px-4">{s.name}</td>
      <td className="py-2 px-4 flex items-center gap-4">
        <button
          onClick={() => toggleAttendance(s.id)}
          className={`px-4 py-1 rounded font-semibold ${
            attendanceMap[s.id] ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}
          disabled={!selectedTeacher}
        >
          {attendanceMap[s.id] ? "Present" : "Absent"}
        </button>
        {record && (
          <span className="text-sm text-gray-600">
            Marked by {teacherName} at {new Date(record.timestamp).toLocaleTimeString()}
          </span>
        )}
      </td>
    </tr>
  );
})}

            </tbody>
          </table>
        </div>
      )}

      {/* Success message */}
      {successMsg && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow z-50">
          {successMsg}
        </div>
      )}
    </div>
  );
}
