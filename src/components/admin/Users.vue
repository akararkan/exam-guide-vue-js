<template>
  <div class="user-management">
    <div class="user-container">
      <!-- Header Section -->
      <div class="user-header">
        <h1>Users</h1>
        <div class="user-controls">
          <!-- Search Bar -->
          <input type="text" v-model="searchQuery" class="user-search" placeholder="Search users..."
            @input="filterUsers" />
          
          <!-- Excel Import/Export Controls -->
          <div class="excel-controls">
            <!-- Excel Import -->
            <input
              type="file"
              id="excel-upload"
              accept=".xlsx, .xls"
              ref="fileInput"
              class="excel-file-input"
              @change="handleFileUpload"
              style="display: none"
            />
            <button class="user-excel-btn" @click="triggerFileInput">
              Import Excel
            </button>
            
            <!-- Excel Export -->
            <button class="user-excel-btn" @click="exportUsersToExcel">
              Export Excel
            </button>
          </div>
          
          <!-- Add User Button -->
          <button class="user-toggle-btn" @click="openAddModal">Add User</button>

          <!-- Fourth Grade Graduation Button -->
          <button class="user-toggle-btn graduation-btn" @click="showGraduationPanel">
            Manage Level 4 Graduation
          </button>
        </div>
      </div>

      <!-- Users Table -->
      <div class="user-table-responsive">
        <table class="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Level</th> 
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.fname }} {{ user.lname }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.phone }}</td>
              <td>{{ user.role }}</td>
              <td>{{ getDepartmentLevel(user) }}</td>
              <td>{{ user.departmentName || "N/A" }}</td>
              <td class="user-action-cell">
                <button class="user-btn-edit" @click="openEditModal(user)">
                  Edit
                </button>
                <button class="user-btn-delete" @click="confirmDelete(user.id)">
                  Delete
                </button>
                <button class="user-btn-reset" @click="openResetPasswordModal(user)">
                  Reset Password
                </button>
              </td>
            </tr>
            <tr v-if="filteredUsers.length === 0">
              <td colspan="9" class="user-no-data">No users found.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Graduation Management Panel -->
      <div v-if="isGraduationPanelOpen" class="user-form-container graduation-form-container">
        <h3 class="graduation-title">Level 4 Graduation Management</h3>
        
        <div class="graduation-controls">
          <button class="user-excel-btn select-all-btn" @click="selectAllLevelFourStudents">
            Select All Level 4 Students
          </button>
          <button class="deletion-btn delete-selected-btn" @click="handleDeleteSelected">
            Delete Selected Students
          </button>
          <button class="deletion-btn delete-all-btn" @click="handleDeleteAllLevel4">
            Delete All Level 4 Students
          </button>
        </div>
        
        <div class="graduation-table-wrapper">
          <table class="user-table graduation-table">
            <thead>
              <tr>
                <th>Select</th>
                <th>Student ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Level</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in levelFourStudents" :key="student.id">
                <td>
                  <input 
                    type="checkbox" 
                    :checked="selectedStudents.includes(student.id)" 
                    @change="toggleStudentSelection(student.id)" 
                    class="graduation-checkbox"
                  />
                </td>
                <td>{{ student.id }}</td>
                <td>{{ student.fname }} {{ student.lname }}</td>
                <td>{{ student.departmentName }}</td>
                <td><span class="level-badge">{{ getDepartmentLevel(student) }}</span></td>
              </tr>
              <tr v-if="levelFourStudents.length === 0">
                <td colspan="5" class="user-no-data">No level 4 students found.</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="graduation-panel-actions">
          <button type="button" class="user-btn-cancel" @click="closeGraduationPanel">
            Close
          </button>
        </div>
      </div>

      <!-- Password Reset Modal -->
      <div v-if="isResetPasswordModalOpen" class="user-form-container">
        <h3>Reset Password</h3>
        <form @submit.prevent="resetPassword" class="user-elegant-form">
          <div class="user-form-group">
            <label for="new-password">New Password</label>
            <input v-model="resetPasswordForm.newPassword" type="password" id="new-password" class="user-form-control"
              placeholder="Enter New Password" required />
          </div>
          <div class="user-form-group">
            <label for="confirm-password">Confirm Password</label>
            <input v-model="resetPasswordForm.confirmPassword" type="password" id="confirm-password"
              class="user-form-control" placeholder="Confirm New Password" required />
          </div>
          <div class="user-modal-actions">
            <button type="button" class="user-btn-cancel" @click="closeResetPasswordModal">
              Cancel
            </button>
            <button type="submit" class="user-btn-submit">
              Reset Password
            </button>
          </div>
        </form>
      </div>

      <!-- Modal for Add/Update User -->
      <div v-if="isModalOpen" class="user-form-container">
        <h3>{{ modalTitle }}</h3>
        <form @submit.prevent="submitForm" class="user-elegant-form">
          <div class="user-form-group">
            <label for="first-name">First Name</label>
            <input v-model="userForm.fname" type="text" id="first-name" class="user-form-control"
              placeholder="Enter First Name" required />
          </div>
          <div class="user-form-group">
            <label for="last-name">Last Name</label>
            <input v-model="userForm.lname" type="text" id="last-name" class="user-form-control"
              placeholder="Enter Last Name" required />
          </div>
          <div class="user-form-group">
            <label for="username">Username</label>
            <input v-model="userForm.username" type="text" id="username" class="user-form-control"
              placeholder="Enter Username" required />
          </div>
          <div class="user-form-group">
            <label for="email">Email</label>
            <input v-model="userForm.email" type="email" id="email" class="user-form-control" placeholder="Enter Email"
              required />
          </div>
          <div class="user-form-group">
            <label for="phone">Phone</label>
            <input v-model="userForm.phone" type="text" id="phone" class="user-form-control" placeholder="Enter Phone"
              required />
          </div>
          <div class="user-form-group">
            <label for="role">Role</label>
            <select v-model="userForm.role" id="role" class="user-form-control" required>
              <option value="" disabled>Select Role</option>
              <option value="ADMIN">Admin</option>
              <option value="STUDENT">Student</option>
              <option value="TEACHER">Teacher</option>
              <option value="COMMITTEE">Committee</option>
            </select>
          </div>
          
          <div class="user-form-group">
            <label for="department">Department</label>
            <select v-model="userForm.departmentId" id="department" class="user-form-control" required>
              <option value="" disabled>Select Department</option>
              <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                {{ dept.name }} (Level: {{ dept.level || 'N/A' }})
              </option>
            </select>
          </div>
          <div class="user-form-group">
            <label for="password">Password</label>
            <input v-model="userForm.password" type="password" id="password" class="user-form-control"
              placeholder="Enter Password" required />
          </div>
          <div class="user-modal-actions">
            <button type="button" class="user-btn-cancel" @click="closeModal">
              Cancel
            </button>
            <button type="submit" class="user-btn-submit">
              {{ modalButtonText }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";

// Reactive state for user data
const users = ref([]);
const departments = ref([]); // State for departments
const searchQuery = ref("");
const isResetPasswordModalOpen = ref(false);
const resetPasswordForm = ref({
  email: "",
  newPassword: "",
  confirmPassword: ""
});

// Graduation-related state
const isGraduationPanelOpen = ref(false);
const selectedStudents = ref([]);

const userForm = ref({
  id: null,
  fname: "",
  lname: "",
  username: "",
  email: "",
  phone: "",
  role: "",
  password: "",
  departmentId: null,
});

const isModalOpen = ref(false);
const modalTitle = ref("Add User");
const modalButtonText = ref("Add");
const fileInput = ref(null); // Reference to file input element

// Base API URLs
const USER_API_URL = "http://localhost:8081/api/v1/user";
const DEPARTMENT_API_URL = "http://localhost:8081/api/v1/department";

// Computed property for filtered users
const filteredUsers = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return users.value.filter(user =>
    user.fname.toLowerCase().includes(query) ||
    user.lname.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query) ||
    user.username.toLowerCase().includes(query)
  );
});

// Helper function to get department level for a user
const getDepartmentLevel = (user) => {
  if (!user.departmentId) return 'N/A';
  const department = departments.value.find(dept => dept.id === user.departmentId);
  return department && department.level !== undefined ? department.level : 'N/A';
};

// Computed property for level 4 students
const levelFourStudents = computed(() => {
  return users.value.filter(user => {
    const level = getDepartmentLevel(user);
    return user.role === 'STUDENT' && level == 4; // Using loose equality for comparison
  });
});

// Fetch users and departments on mount
onMounted(() => {
  fetchUsersAndDepartments();
});

// Fetch users and map department names
const fetchUsersAndDepartments = async () => {
  try {
    const [usersResponse, departmentsResponse] = await Promise.all([
      axios.get(`${USER_API_URL}/getAllUsers`),
      axios.get(`${DEPARTMENT_API_URL}/getAllDepartments`),
    ]);
    departments.value = departmentsResponse.data;
    users.value = usersResponse.data.map((user) => {
      const department = departments.value.find(
        (dept) => dept.id === user.departmentId
      );
      return {
        ...user,
        departmentName: department ? department.name : "N/A"
      };
    });
  } catch (error) {
    console.error("Error fetching users or departments:", error);
    alert("Failed to fetch users or departments. Please try again.");
  }
};

// Open Add Modal
const openAddModal = () => {
  userForm.value = {
    id: null,
    fname: "",
    lname: "",
    username: "",
    email: "",
    phone: "",
    role: "",
    password: "",
    departmentId: null,
    graduated: false,
  };
  modalTitle.value = "Add User";
  modalButtonText.value = "Add";
  isModalOpen.value = true;
};

// Open Edit Modal
const openEditModal = (user) => {
  userForm.value = { ...user };
  modalTitle.value = "Edit User";
  modalButtonText.value = "Update";
  isModalOpen.value = true;
};

// Open Reset Password Modal
const openResetPasswordModal = (user) => {
  resetPasswordForm.value = {
    email: user.email,
    newPassword: "",
    confirmPassword: ""
  };
  isResetPasswordModalOpen.value = true;
};

// Close Reset Password Modal
const closeResetPasswordModal = () => {
  isResetPasswordModalOpen.value = false;
  resetPasswordForm.value = {
    email: "",
    newPassword: "",
    confirmPassword: ""
  };
};

// Reset Password
const resetPassword = async () => {
  try {
    if (resetPasswordForm.value.newPassword !== resetPasswordForm.value.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    await axios.post(`${USER_API_URL}/resetPassword`, null, {
      params: {
        email: resetPasswordForm.value.email,
        newPassword: resetPasswordForm.value.newPassword
      }
    });

    alert("Password reset successfully.");
    closeResetPasswordModal();
    fetchUsersAndDepartments();
  } catch (error) {
    console.error("Error resetting password:", error);
    alert("Failed to reset password. Please try again.");
  }
};

// Submit Add or Update User
const submitForm = async () => {
  if (modalButtonText.value === "Add") {
    await addUser();
  } else {
    await updateUser(userForm.value.id);
  }
  closeModal();
  fetchUsersAndDepartments();
};

// Add a new user
const addUser = async () => {
  try {
    const newUser = {
      fname: userForm.value.fname,
      lname: userForm.value.lname,
      username: userForm.value.username,
      email: userForm.value.email,
      phone: userForm.value.phone,
      role: userForm.value.role,
      password: userForm.value.password,
      graduated: userForm.value.role === 'STUDENT' ? userForm.value.graduated : false,
    };
    const departmentId = userForm.value.departmentId;
    if (!departmentId) {
      alert("Please select a department.");
      return;
    }
    await axios.post(`${USER_API_URL}/register/${departmentId}`, newUser);
    alert("User added successfully.");
  } catch (error) {
    console.error("Error adding user:", error);
    alert("Failed to add user. Please try again.");
  }
};

// Update an existing user
const updateUser = async (id) => {
  try {
    const updatedUser = {
      fname: userForm.value.fname,
      lname: userForm.value.lname,
      username: userForm.value.username,
      email: userForm.value.email,
      phone: userForm.value.phone,
      role: userForm.value.role,
      password: userForm.value.password,
      graduated: userForm.value.role === 'STUDENT' ? userForm.value.graduated : false,
    };
    const departmentId = userForm.value.departmentId;
    if (!departmentId) {
      alert("Please select a department.");
      return;
    }
    await axios.put(
      `${USER_API_URL}/updateUserById/${id}/${departmentId}`,
      updatedUser
    );
    alert("User updated successfully.");
    fetchUsersAndDepartments();
  } catch (error) {
    console.error("Error updating user:", error);
    if (error.response && error.response.data) {
      alert(
        `Failed to update user: ${error.response.data.message || error.message}`
      );
    } else {
      alert("Failed to update user. Please try again.");
    }
  }
};

// Confirm before deleting a user
const confirmDelete = (id) => {
  console.log("Confirm delete called for ID:", id);
  if (window.confirm("Are you sure you want to delete this user? Click OK to delete or Cancel to abort.")) {
    console.log("User confirmed deletion for ID:", id);
    deleteUser(id);
  } else {
    console.log("User cancelled deletion");
  }
};

// Delete a user by ID
const deleteUser = async (id) => {
  console.log("Delete user function called with ID:", id);
  try {
    // Ensure the ID is correctly formatted
    const userId = Number(id);
    if (isNaN(userId)) {
      console.error("Invalid user ID:", id);
      alert("Failed to delete user: Invalid ID");
      return;
    }
    
    console.log("Sending DELETE request to:", `${USER_API_URL}/deleteUserById/${userId}`);
    
    // Make the delete request with detailed error handling
    const response = await axios.delete(`${USER_API_URL}/deleteUserById/${userId}`);
    console.log("Delete response:", response);
    
    alert("User deleted successfully.");
    await fetchUsersAndDepartments();
  } catch (error) {
    console.error("Error deleting user:", error);
    
    // Provide more detailed error information to help debugging
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
      alert(`Failed to delete user. Server responded with: ${error.response.status} ${error.response.statusText}`);
    } else if (error.request) {
      console.error("No response received. Request:", error.request);
      alert("Failed to delete user. No response received from server.");
    } else {
      console.error("Error message:", error.message);
      alert(`Failed to delete user: ${error.message}`);
    }
  }
};

// Close the modal
const closeModal = () => {
  isModalOpen.value = false;
};

// Excel Export Function
const exportUsersToExcel = async () => {
  try {
    const response = await axios.get(`${USER_API_URL}/exportUsers`, {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'users.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error exporting users:", error);
    alert("Failed to export users to Excel. Please try again.");
  }
};

// Trigger file input click
const triggerFileInput = () => {
  fileInput.value.click();
};

// Handle file selection for Excel import
const handleFileUpload = async (event) => {
  try {
    const file = event.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    await axios.post(`${USER_API_URL}/importUsers`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    alert("Users imported successfully!");
    fetchUsersAndDepartments();
    
    // Reset file input
    event.target.value = null;
  } catch (error) {
    console.error("Error importing users:", error);
    alert("Failed to import users from Excel. Please check your file format and try again.");
  }
};

// Graduation Management Functions

// Filter users function
const filterUsers = () => {
  // This function is needed to handle the @input event on the search bar
  // The filtering is done by the computed property filteredUsers
};

// Show graduation panel
const showGraduationPanel = () => {
  isGraduationPanelOpen.value = true;
  selectedStudents.value = []; // Reset selected students
};

// Close graduation panel
const closeGraduationPanel = () => {
  isGraduationPanelOpen.value = false;
  selectedStudents.value = []; // Clear selections
};

// Toggle selection of a student
const toggleStudentSelection = (studentId) => {
  const index = selectedStudents.value.indexOf(studentId);
  if (index === -1) {
    selectedStudents.value.push(studentId);
  } else {
    selectedStudents.value.splice(index, 1);
  }
};

// Select all level 4 students
const selectAllLevelFourStudents = () => {
  selectedStudents.value = levelFourStudents.value.map(student => student.id);
};

// Handler functions to ensure we catch any errors
const handleDeleteSelected = () => {
  console.log("Handle delete selected called");
  try {
    deleteSelectedStudents();
  } catch (error) {
    console.error("Error in handleDeleteSelected:", error);
    alert("An error occurred while trying to delete selected students. See console for details.");
  }
};

const handleDeleteAllLevel4 = () => {
  console.log("Handle delete all level 4 called");
  try {
    deleteAllLevelFourStudents();
  } catch (error) {
    console.error("Error in handleDeleteAllLevel4:", error);
    alert("An error occurred while trying to delete all level 4 students. See console for details.");
  }
};

// Delete selected students
const deleteSelectedStudents = () => {
  console.log("Delete selected students function called");
  if (selectedStudents.value.length === 0) {
    alert("Please select at least one student to delete.");
    return;
  }

  if (window.confirm(`Are you sure you want to delete ${selectedStudents.value.length} selected student(s)?`)) {
    console.log("Deleting selected students:", selectedStudents.value);
    // Process one by one
    selectedStudents.value.forEach(studentId => {
      console.log("Processing deletion for student ID:", studentId);
      deleteUser(studentId);
    });
    
    // Clear selections after deletion
    selectedStudents.value = [];
  }
};

// Delete all level 4 students (graduation)
const deleteAllLevelFourStudents = () => {
  console.log("Delete all level 4 students function called");
  const levelFourCount = levelFourStudents.value.length;
  
  if (levelFourCount === 0) {
    alert("There are no level 4 students to delete.");
    return;
  }
  
  if (window.confirm(`Are you sure you want to delete ALL ${levelFourCount} level 4 student(s)? This action cannot be undone!`)) {
    console.log("Confirmed deletion of all level 4 students");
    // Use the same approach as the regular delete button
    levelFourStudents.value.forEach(student => {
      console.log("Processing deletion for level 4 student ID:", student.id);
      deleteUser(student.id);
    });
  }
};
</script>


<style scoped>
/* Container for the search bar and button */
.user-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  /* Space between search bar and button */
  margin-bottom: 20px;
}

/* Search Input Styles */
.user-search {
  width: 100%;
  max-width: 350px;
  /* Max width for the search input */
  padding: 12px 16px;
  font-size: 16px;
  color: #2c3e50;
  background-color: #ffffff;
  border: 1px solid #ced6e0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.user-search:focus {
  border-color: #4a90e2;
  /* Blue border on focus */
  outline: none;
  box-shadow: 0 0 5px rgba(74, 144, 226, 0.3);
  /* Light blue glow effect */
}

.user-search::placeholder {
  color: #7f8c8d;
  font-style: italic;
  opacity: 0.7;
}

.user-search:disabled {
  background-color: #f2f2f2;
  border-color: #e0e0e0;
}


/* Global Styles */
.user-management {
  font-family: "Inter", "Segoe UI", Roboto, Arial, sans-serif;
  background-color: #f4f6f9;
  color: #2c3e50;
  min-height: 100vh;
  padding: 40px 0;
}

.user-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
}

/* Header Styles */
.user-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding-bottom: 10px;
  border-bottom: 1px solid #dfe6e9;
}

.user-header h1 {
  font-size: 32px;
  font-weight: 700;
  margin: 0;
  color: #2c3e50;
}

/* Add User Button */
.user-toggle-btn {
  background-color: #4a90e2;
  color: #ffffff;
  padding: 12px 20px;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s, transform 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.user-toggle-btn:hover {
  background-color: #357ab8;
  transform: translateY(-2px);
}

.graduation-btn {
  background-color: #9b59b6;
}

.graduation-btn:hover {
  background-color: #8e44ad;
}

/* Table Styles */
.user-table-responsive {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
}

.user-table th,
.user-table td {
  padding: 18px 20px;
  border-bottom: 1px solid #dfe6e9;
  text-align: left;
  font-size: 16px;
}

.user-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  text-transform: uppercase;
  color: #34495e;
  font-size: 14px;
}

.user-table tbody tr:hover {
  background-color: #f1f2f6;
}

.user-action-cell {
  display: flex;
  gap: 10px;
}

.user-no-data {
  text-align: center;
  padding: 20px;
  color: #7f8c8d;
  font-style: italic;
}

/* Button Styles */

/* Edit Button */
.user-btn-edit {
  background-color: #f39c12;
  color: #ffffff;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;
}

.user-btn-edit:hover {
  background-color: #d35400;
  transform: translateY(-2px);
}

/* Delete Button */
.user-btn-delete {
  background-color: #e74c3c;
  color: #ffffff;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;
}

.user-btn-delete:hover {
  background-color: #c0392b;
  transform: translateY(-2px);
}

/* Secondary Button (Cancel) */
.user-btn-cancel {
  background-color: #95a5a6;
  color: #ffffff;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;
}

.user-btn-cancel:hover {
  background-color: #7f8c8d;
  transform: translateY(-2px);
}

/* Success Button (Submit/Update) */
.user-btn-submit {
  background-color: #2ecc71;
  color: #ffffff;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;
}

.user-btn-submit:hover {
  background-color: #27ae60;
  transform: translateY(-2px);
}

/* Form Styles */
.user-form-container {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
  animation: fadeIn 0.5s ease-in-out;
}

.user-elegant-form {
  display: flex;
  flex-direction: column;
}

.user-form-group {
  margin-bottom: 25px;
}

.user-form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #34495e;
}

.user-form-control {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #ced6e0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.user-form-control:focus {
  border-color: #4a90e2;
  box-shadow: 0 0 0 4px rgba(74, 144, 226, 0.2);
  outline: none;
}

.user-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
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
  .user-toggle-btn {
    padding: 10px 16px;
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .user-header {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }

  .user-table-responsive {
    overflow-x: scroll;
  }

  .user-action-cell {
    flex-direction: column;
    gap: 8px;
  }

  .user-modal-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .user-modal-actions .user-btn-cancel,
  .user-modal-actions .user-btn-submit {
    width: 100%;
  }
}

/* Reset Button Styles */
.user-btn-reset {
  background-color: #27b79d;
  color: #ffffff;
  padding: 8px 16px;
  font-size: 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.user-btn-reset:hover {
  background-color: #4bbe7f;
  transform: translateY(-2px);
}

.user-btn-reset:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.6);
}
/* Add these styles to your existing CSS */
.excel-controls {
  display: flex;
  gap: 10px;
  margin-right: 10px;
}

.user-excel-btn {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.user-excel-btn:hover {
  background-color: #218838;
}

.user-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.excel-file-input {
  display: none;
}

/* Graduation Panel Styles - Enhanced */
.graduation-form-container {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
}

.graduation-title {
  color: #3498db;
  font-size: 24px;
  margin-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 15px;
}

.graduation-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 25px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.select-all-btn {
  background-color: #3498db;
  color: white;
}

.select-all-btn:hover {
  background-color: #2980b9;
}

.deletion-btn {
  background-color: #e74c3c;
  color: white;
  font-weight: 500;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.deletion-btn:hover {
  background-color: #c0392b;
  transform: translateY(-2px);
}

.deletion-btn:active {
  transform: translateY(1px);
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.1);
}

.delete-selected-btn, .delete-all-btn {
  font-weight: 500;
}

.graduation-table-wrapper {
  margin-bottom: 25px;
  overflow-x: auto;
}

.graduation-table {
  width: 100%;
  margin-bottom: 0;
}

.graduation-table th {
  background-color: #34495e;
  color: white;
  font-weight: 600;
}

.graduation-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.level-badge {
  background-color: #8e44ad;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
}

.graduation-panel-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>