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
          <!-- Add User Button -->
          <button class="user-toggle-btn" @click="openAddModal">Add User</button>
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
              <th>Password</th>
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
              <td>{{ user.password }}</td>
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
                {{ dept.name }}
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
        departmentName: department ? department.name : "N/A",
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
  if (window.confirm("Are you sure you want to delete this user?")) {
    deleteUser(id);
  }
};

// Delete a user by ID
const deleteUser = async (id) => {
  try {
    await axios.delete(`${USER_API_URL}/deleteUserById/${id}`);
    alert("User deleted successfully.");
    fetchUsersAndDepartments();
  } catch (error) {
    console.error("Error deleting user:", error);
    alert("Failed to delete user. Please try again.");
  }
};

// Close the modal
const closeModal = () => {
  isModalOpen.value = false;
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
</style>
