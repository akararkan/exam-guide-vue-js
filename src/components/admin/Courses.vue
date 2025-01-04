<template>
  <div class="course-management">
    <div class="container">
      <div class="header">
        <h1>Course Management</h1>
        <button
          class="toggle-form-btn"
          @click="toggleForm"
          :aria-label="showForm ? 'Close form' : 'Add Course'"
        >
          <i :class="showForm ? 'fa fa-times' : 'fa fa-plus'"></i>
          <span>{{ showForm ? "Close" : "Add Course" }}</span>
        </button>
      </div>

      <!-- Add/Edit Course Form -->
      <transition name="fade">
        <div v-if="showForm" class="form-container">
          <h3>{{ formTitle }}</h3>
          <form @submit.prevent="submitCourse" class="elegant-form">
            <!-- Form Fields -->
            <div class="form-group">
              <label for="courseName">Course Name</label>
              <div class="input-wrapper">
                <i class="fa fa-book"></i>
                <input
                  v-model="form.name"
                  type="text"
                  id="courseName"
                  class="form-control"
                  required
                  placeholder="Enter course name"
                />
              </div>
            </div>
            <div class="form-group">
              <label for="courseDescription">Description</label>
              <div class="input-wrapper">
                <i class="fa fa-info-circle"></i>
                <textarea
                  v-model="form.description"
                  id="courseDescription"
                  class="form-control"
                  required
                  placeholder="Enter course description"
                ></textarea>
              </div>
            </div>
            <div class="form-group">
              <label for="courseYear">Year</label>
              <div class="input-wrapper">
                <i class="fa fa-calendar-alt"></i>
                <input
                  v-model="form.year"
                  type="number"
                  id="courseYear"
                  class="form-control"
                  required
                  min="1"
                  max="5"
                  placeholder="Enter academic year"
                />
              </div>
            </div>
            <div class="form-group">
              <label for="courseDepartment">Department</label>
              <div class="input-wrapper">
                <i class="fa fa-university"></i>
                <select
                  v-model="form.department"
                  id="courseDepartment"
                  class="form-control"
                  required
                >
                  <option value="" disabled>Select Department</option>
                  <option
                    v-for="dept in departments"
                    :key="dept.id"
                    :value="dept.id"
                  >
                    {{ dept.name }}
                  </option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label for="courseExamSchedule">Exam Schedule</label>
              <div class="input-wrapper">
                <i class="fa fa-calendar-check"></i>
                <select
                  v-model="form.examSchedule"
                  id="courseExamSchedule"
                  class="form-control"
                  required
                >
                  <option value="" disabled>Select Exam Schedule</option>
                  <option
                    v-for="exam in examSchedules"
                    :key="exam.id"
                    :value="exam.id"
                  >
                    {{ formatDate(exam.examDate) }}
                  </option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label for="courseSemesterSchedule">Semester Schedule</label>
              <div class="input-wrapper">
                <i class="fa fa-calendar-alt"></i>
                <select
                  v-model="form.semesterSchedule"
                  id="courseSemesterSchedule"
                  class="form-control"
                  required
                >
                  <option value="" disabled>Select Semester Schedule</option>
                  <option
                    v-for="semester in semesterSchedules"
                    :key="semester.id"
                    :value="semester.id"
                  >
                    {{ semester.semesterName }}
                  </option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label for="courseUser">User</label>
              <div class="input-wrapper">
                <i class="fa fa-user"></i>
                <select
                  v-model="form.user"
                  id="courseUser"
                  class="form-control"
                  required
                >
                  <option value="" disabled>Select User</option>
                  <option v-for="user in users" :key="user.id" :value="user.id">
                    {{ user.username || user.id }}
                  </option>
                </select>
              </div>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" @click="closeForm">
                Cancel
              </button>
              <button type="submit" class="btn-success">
                {{ formButtonText }}
              </button>
            </div>
          </form>
        </div>
      </transition>

      <!-- Course List -->
      <div class="course-list" v-if="!isLoading">
        <div class="list-header">
          <h2>All Courses</h2>
          <div class="search-container">
            <i class="fa fa-search"></i>
            <input
              v-model="searchQuery"
              placeholder="Search by course name"
              class="search-input"
            />
          </div>
        </div>

        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Year</th>
                <th>Department</th>
                <th>Exam Schedule</th>
                <th>Semester Schedule</th>
                <th>User</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="course in filteredCourses" :key="course.id">
                <td>{{ course.name }}</td>
                <td>{{ course.description }}</td>
                <td>{{ course.year }}</td>
                <td>{{ displayDepartment(course.department) }}</td>
                <td>{{ displayExamSchedule(course.examSchedule) }}</td>
                <td>{{ displaySemesterSchedule(course.semesterSchedule) }}</td>
                <td>{{ course.user?.email || 'N/A' }}</td>
                <td class="action-cell">
                  <button
                    @click="editCourse(course)"
                    class="btn-warning btn-sm"
                  >
                    <i class="fa fa-edit"></i> Edit
                  </button>
                  <button
                    @click="deleteCourse(course.id)"
                    class="btn-danger btn-sm"
                  >
                    <i class="fa fa-trash"></i> Delete
                  </button>
                </td>
              </tr>
              <tr v-if="filteredCourses.length === 0">
                <td colspan="8" class="no-data">No courses found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else>
        <p>Loading courses...</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      courses: [],
      departments: [],
      examSchedules: [],
      semesterSchedules: [],
      users: [], // Added for fetching users
      form: {
        name: "",
        description: "",
        year: "",
        department: "",
        examSchedule: "",
        semesterSchedule: "",
        user: "", // Added for user selection
      },
      searchQuery: "",
      showForm: false,
      isEditing: false,
      editingCourseId: null,
      formTitle: "Add Course",
      formButtonText: "Add",
      isLoading: true, // Added for loading state
    };
  },
  computed: {
    filteredCourses() {
      return this.courses
        .filter((course) =>
          course.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        )
        .map((course) => ({
          ...course,
          departmentName: course.department?.name || "N/A",
          examScheduleDate: course.examSchedule?.examDate
            ? this.formatDate(course.examSchedule.examDate)
            : "N/A",
          semesterScheduleName: course.semesterSchedule?.semesterName || "N/A",
        }));
    },
  },
  created() {
    Promise.all([
      this.fetchAllCourses(),
      this.fetchDepartments(),
      this.fetchExamSchedules(),
      this.fetchSemesterSchedules(),
      this.fetchUsers(), // Added for fetching users
    ])
      .then(() => {
        this.isLoading = false;
        console.log("All data fetched successfully.");
      })
      .catch((error) => {
        console.error("Error fetching initial data:", error);
        this.isLoading = false;
      });
  },
  methods: {
    toggleForm() {
      this.showForm = !this.showForm;
      if (!this.showForm) {
        this.resetForm();
      }
    },
    closeForm() {
      this.showForm = false;
      this.resetForm();
    },
    resetForm() {
      this.form = {
        name: "",
        description: "",
        year: "",
        department: "",
        examSchedule: "",
        semesterSchedule: "",
        user: "",
      };
      this.isEditing = false;
      this.editingCourseId = null;
      this.formTitle = "Add Course";
      this.formButtonText = "Add";
    },
    async fetchAllCourses() {
      try {
        const [coursesResponse, usersResponse] = await Promise.all([
          axios.get("http://localhost:8081/api/v1/course/getAllCourses"),
          axios.get("http://localhost:8081/api/v1/user/getAllUsers"),
        ]);

        const users = usersResponse.data.reduce((map, user) => {
          map[user.id] = user;
          return map;
        }, {});

        this.courses = coursesResponse.data.map((course) => ({
          ...course,
          user: users[course.userId] || { username: "N/A" },
        }));
        console.log("Courses Data:", this.courses);
      } catch (error) {
        console.error("Error fetching courses or users:", error);
        alert("Failed to fetch courses.");
      }
    },
    async fetchDepartments() {
      try {
        const response = await axios.get(
          "http://localhost:8081/api/v1/department/getAllDepartments"
        );
        this.departments = response.data;
        console.log("Departments Data:", this.departments);
      } catch (error) {
        console.error("Error fetching departments:", error);
        alert("Failed to fetch departments.");
      }
    },
    async fetchExamSchedules() {
      try {
        const response = await axios.get(
          "http://localhost:8081/api/v1/exam-schedule/getAllExamSchedules"
        );
        this.examSchedules = response.data;
        console.log("Exam Schedules Data:", this.examSchedules);
      } catch (error) {
        console.error("Error fetching exam schedules:", error);
        alert("Failed to fetch exam schedules.");
      }
    },
    async fetchSemesterSchedules() {
      try {
        const response = await axios.get(
          "http://localhost:8081/api/v1/semester-schedule/getAllSemesterSchedules"
        );
        this.semesterSchedules = response.data;
        console.log("Semester Schedules Data:", this.semesterSchedules);
      } catch (error) {
        console.error("Error fetching semester schedules:", error);
        alert("Failed to fetch semester schedules.");
      }
    },
    async fetchUsers() {
      try {
        const response = await axios.get(
          "http://localhost:8081/api/v1/user/getAllUsers"
        );
        this.users = response.data;
        console.log("Users Data:", this.users);
      } catch (error) {
        console.error("Error fetching users:", error);
        alert("Failed to fetch users.");
      }
    },
    async submitCourse() {
      if (this.isEditing) {
        await this.updateCourse();
      } else {
        await this.addCourse();
      }
    },
    async addCourse() {
      try {
        const { department, examSchedule, semesterSchedule, user } = this.form;
        const response = await axios.post(
          `http://localhost:8081/api/v1/course/addCourse/${user}/${department}/${examSchedule}/${semesterSchedule}`,
          {
            name: this.form.name,
            description: this.form.description,
            year: this.form.year,
          }
        );
        this.courses.push(response.data);
        alert("Course added successfully!");
        this.closeForm();
      } catch (error) {
        console.error("Error adding course:", error);
        alert("Failed to add course.");
      }
    },
    async deleteCourse(courseId) {
      if (!confirm("Are you sure you want to delete this course?")) return;

      try {
        await axios.delete(
          `http://localhost:8081/api/v1/course/deleteCourseById/${courseId}`
        );
        this.courses = this.courses.filter((course) => course.id !== courseId);
        alert("Course deleted successfully!");
      } catch (error) {
        console.error("Error deleting course:", error);
        alert("Failed to delete course.");
      }
    },
    editCourse(course) {
      this.isEditing = true;
      this.editingCourseId = course.id;
      this.form.name = course.name;
      this.form.description = course.description;
      this.form.year = course.year;
      this.form.department = course.department.id;
      this.form.examSchedule = course.examSchedule.id;
      this.form.semesterSchedule = course.semesterSchedule.id;
      this.form.user = course.user?.id || "";

      this.formTitle = "Edit Course";
      this.formButtonText = "Update";

      this.showForm = true;
    },
    async updateCourse() {
      try {
        const { department, examSchedule, semesterSchedule, user } = this.form;
        const response = await axios.put(
          `http://localhost:8081/api/v1/course/updateCourse/${this.editingCourseId}/${user}/${department}/${examSchedule}/${semesterSchedule}`,
          {
            name: this.form.name,
            description: this.form.description,
            year: this.form.year,
          }
        );
        const updatedCourse = response.data;

        const index = this.courses.findIndex(
          (course) => course.id === this.editingCourseId
        );
        if (index !== -1) {
          this.courses[index] = updatedCourse;
        }

        alert("Course updated successfully!");
        this.closeForm();
      } catch (error) {
        console.error("Error updating course:", error);
        alert("Failed to update course.");
      }
    },
    displayDepartment(department) {
      return department && department.name ? department.name : "N/A";
    },
    displayExamSchedule(examSchedule) {
      return examSchedule && examSchedule.examDate
        ? this.formatDate(examSchedule.examDate)
        : "N/A";
    },
    displaySemesterSchedule(semesterSchedule) {
      return semesterSchedule && semesterSchedule.semesterName
        ? semesterSchedule.semesterName
        : "N/A";
    },
    formatDate(date) {
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(date).toLocaleDateString(undefined, options);
    },
  },
};
</script>

<style scoped>
/* Remove CSS Variables and use direct color codes */

/* Global Styles */
.course-management {
  font-family: "Inter", "Segoe UI", Roboto, Arial, sans-serif;
  background-color: #f4f6f9; /* Direct color code */
  color: #2c3e50; /* Direct color code */
  min-height: 100vh;
  padding: 40px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
}

/* Header Styles */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding-bottom: 10px;
  border-bottom: 1px solid #dfe6e9;
}

h1 {
  font-size: 32px;
  font-weight: 700;
  margin: 0;
  color: #2c3e50; /* Direct color code */
}

/* Add and Close Toggle Button */
.toggle-form-btn {
  background-color: #4a90e2; /* Direct primary color */
  color: #ffffff; /* White text */
  padding: 12px 20px;
  font-size: 16px;
  border: none;
  border-radius: 8px; /* Direct border-radius */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Direct box-shadow */
  transition: background-color 0.3s, transform 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.toggle-form-btn i {
  font-size: 18px;
}

.toggle-form-btn:hover {
  background-color: #357ab8; /* Darker shade of primary */
  transform: translateY(-2px);
}

/* Form Styles */
.form-container {
  background-color: #ffffff; /* White background */
  border-radius: 8px; /* Direct border-radius */
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Direct box-shadow */
  margin-bottom: 40px;
  animation: fadeIn 0.5s ease-in-out;
}

.elegant-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #34495e; /* Direct secondary color */
}

.input-wrapper {
  position: relative;
}

.input-wrapper i {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #34495e; /* Direct secondary color */
  opacity: 0.7;
  font-size: 16px;
}

.form-control {
  width: 100%;
  padding: 12px 14px 12px 40px;
  border: 1px solid #ced6e0; /* Direct border color */
  border-radius: 8px; /* Direct border-radius */
  font-size: 16px;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-control:focus {
  border-color: #4a90e2; /* Direct primary color */
  box-shadow: 0 0 0 4px rgba(74, 144, 226, 0.2); /* Direct box-shadow */
  outline: none;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

/* Secondary Button (Cancel) */
.btn-secondary {
  background-color: #95a5a6; /* Direct color code */
  color: #ffffff; /* White text */
  padding: 10px 20px;
  border: none;
  border-radius: 8px; /* Direct border-radius */
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;
}

.btn-secondary:hover {
  background-color: #7f8c8d; /* Darker shade */
  transform: translateY(-2px);
}

/* Success Button (Submit/Update) */
.btn-success {
  background-color: #2ecc71; /* Direct success color */
  color: #ffffff; /* White text */
  padding: 10px 20px;
  border: none;
  border-radius: 8px; /* Direct border-radius */
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;
}

.btn-success:hover {
  background-color: #27ae60; /* Darker shade */
  transform: translateY(-2px);
}

/* Table Styles */
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.list-header h2 {
  font-size: 24px;
  color: #2c3e50; /* Direct color code */
}

.search-container {
  position: relative;
}

.search-container i {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #34495e; /* Direct secondary color */
  opacity: 0.7;
  font-size: 18px;
}

.search-input {
  width: 280px;
  padding: 10px 14px 10px 40px;
  border: 1px solid #ced6e0; /* Direct border color */
  border-radius: 8px; /* Direct border-radius */
  font-size: 16px;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.search-input:focus {
  border-color: #4a90e2; /* Direct primary color */
  box-shadow: 0 0 0 4px rgba(74, 144, 226, 0.2); /* Direct box-shadow */
  outline: none;
}

.table-responsive {
  background-color: #ffffff; /* White background */
  border-radius: 8px; /* Direct border-radius */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Direct box-shadow */
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 18px 20px;
  border-bottom: 1px solid #dfe6e9; /* Direct border color */
  text-align: left;
  font-size: 16px;
}

.table th {
  background-color: #f8f9fa; /* Direct background color */
  font-weight: 600;
  text-transform: uppercase;
  color: #34495e; /* Direct secondary color */
  font-size: 14px;
}

.table tbody tr:hover {
  background-color: #f1f2f6; /* Direct hover color */
}

.action-cell {
  display: flex;
  gap: 10px;
}

/* Warning Button (Edit) */
.btn-warning {
  background-color: #f39c12; /* Direct warning color */
  color: #ffffff; /* White text */
  padding: 8px 12px;
  border: none;
  border-radius: 8px; /* Direct border-radius */
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;
}

.btn-warning:hover {
  background-color: #d35400; /* Darker shade */
  transform: translateY(-2px);
}

/* Danger Button (Delete) */
.btn-danger {
  background-color: #e74c3c; /* Direct danger color */
  color: #ffffff; /* White text */
  padding: 8px 12px;
  border: none;
  border-radius: 8px; /* Direct border-radius */
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;
}

.btn-danger:hover {
  background-color: #c0392b; /* Darker shade */
  transform: translateY(-2px);
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #7f8c8d; /* Direct color code */
  font-style: italic;
}

/* Transitions and Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 992px) {
  .search-input {
    width: 220px;
  }
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }

  .list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }

  .search-input {
    width: 100%;
  }

  .action-cell {
    flex-direction: column;
    gap: 8px;
  }

  .modal-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .modal-actions .btn-secondary,
  .modal-actions .btn-success {
    width: 100%;
  }
}
</style>
