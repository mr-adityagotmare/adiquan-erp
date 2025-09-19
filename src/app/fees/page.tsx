"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// ---- Type Definitions ----
interface Course {
  id: string;
  name: string;
}

interface Teacher {
  id: string;
  name: string;
}

interface Fee {
  id: string | null;
  total_amount: number;
  paid_amount: number;
  status: "Paid" | "Pending";
  updated_at: string | null;
  updated_by: string | null;
}

interface Student {
  id: string;
  name: string;
  fees: Fee[];
}

// ---- Component ----
export default function FeesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Fetch active courses
  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, name")
        .eq("status", "Active");
      if (error) console.error("Error fetching courses:", error.message);
      else setCourses((data as Course[]) || []);
    };
    fetchCourses();
  }, []);

  // Fetch active teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      const { data, error } = await supabase
        .from("teachers")
        .select("id, name")
        .eq("status", "Active");
      if (error) console.error("Error fetching teachers:", error.message);
      else setTeachers((data as Teacher[]) || []);
    };
    fetchTeachers();
  }, []);

  // Fetch students + fees for selected course
  useEffect(() => {
    const fetchStudentsAndFees = async () => {
      if (!selectedCourse) {
        setStudents([]);
        return;
      }
      setLoading(true);

      const { data, error } = await supabase
        .from("students")
        .select(`
          id,
          name,
          fees:fees (
            id,
            total_amount,
            paid_amount,
            status,
            updated_at,
            updated_by
          )
        `)
        .eq("course_id", selectedCourse);

      if (error) console.error("Error fetching students with fees:", error.message);
      else setStudents((data as Student[]) || []);

      setLoading(false);
    };
    fetchStudentsAndFees();
  }, [selectedCourse]);

  // Update fee for a student
  const updateFee = async (
    studentId: string,
    feeId: string | null,
    total: number,
    paid: number
  ) => {
    if (!selectedTeacher) {
      alert("Please select a teacher before saving fees");
      return;
    }

    const status: Fee["status"] = paid >= total ? "Paid" : "Pending";

    let query;
    if (feeId) {
      // Update existing
      query = supabase
        .from("fees")
        .update({
          total_amount: total,
          paid_amount: paid,
          status,
          updated_by: selectedTeacher,
          updated_at: new Date(),
        })
        .eq("id", feeId);
    } else {
      // Insert new
      query = supabase.from("fees").insert([
        {
          student_id: studentId,
          course_id: selectedCourse,
          total_amount: total,
          paid_amount: paid,
          status,
          updated_by: selectedTeacher,
          updated_at: new Date(),
        },
      ]);
    }

    const { error } = await query;
    if (error) {
      console.error("Error updating fee:", error.message);
      alert("Failed to update fee ❌");
    } else {
      alert("Fee updated ✅");
      setSelectedCourse(selectedCourse); // refresh data
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">💰 Manage Student Fees</h1>

      {/* Course selector */}
      <div className="flex gap-4 mb-4">
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">-- Select Course --</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Teacher selector */}
        <select
          value={selectedTeacher}
          onChange={(e) => setSelectedTeacher(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">-- Select Teacher --</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading students...</p>
      ) : students.length === 0 ? (
        <p>No students found for this course.</p>
      ) : (
        <table className="min-w-full border border-gray-300 mt-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">Student</th>
              <th className="border px-4 py-2">Total Fee</th>
              <th className="border px-4 py-2">Paid</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Last Updated</th>
              <th className="border px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => {
              const fee: Fee =
                s.fees?.[0] || {
                  id: null,
                  total_amount: 0,
                  paid_amount: 0,
                  status: "Pending",
                  updated_at: null,
                  updated_by: null,
                };

              const teacherName = fee.updated_by
                ? teachers.find((t) => t.id === fee.updated_by)?.name || fee.updated_by
                : "-";

              return (
                <tr key={s.id}>
                  <td className="border px-4 py-2">{s.name}</td>
                  <td className="border px-4 py-2">
                    <input
                      type="number"
                      defaultValue={fee.total_amount}
                      className="border rounded p-1 w-24"
                      id={`total-${s.id}`}
                    />
                  </td>
                  <td className="border px-4 py-2">
                    <input
                      type="number"
                      defaultValue={fee.paid_amount}
                      className="border rounded p-1 w-24"
                      id={`paid-${s.id}`}
                    />
                  </td>
                  <td
                    className={`border px-4 py-2 font-bold ${
                      fee.status === "Paid" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {fee.status}
                  </td>
                  <td className="border px-4 py-2 text-sm">
                    {fee.updated_at
                      ? `${new Date(fee.updated_at).toLocaleString()} (${teacherName})`
                      : "-"}
                  </td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() =>
                        updateFee(
                          s.id,
                          fee.id,
                          Number(
                            (document.getElementById(`total-${s.id}`) as HTMLInputElement)
                              .value
                          ),
                          Number(
                            (document.getElementById(`paid-${s.id}`) as HTMLInputElement)
                              .value
                          )
                        )
                      }
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      Save
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
