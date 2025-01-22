<template>
    <div class="student-requests-container">
      <h1 class="title">Student Requests</h1>
      
      <!-- Table to display student requests -->
      <table v-if="studentRequests.length" class="requests-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Request Header</th>
            <th>Request Body</th>
            <th>Request Date</th>
            <th>User Email</th>
            <th>Request Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(request, index) in studentRequests" :key="request.id">
            <td>{{ request.id }}</td>
            <td>{{ request.requestHeader }}</td>
            <td>{{ request.requestBody }}</td>
            <td>{{ request.requestDate ? new Date(request.requestDate).toLocaleString() : 'N/A' }}</td>
            <td>{{ request.user.email }}</td>
            <td>
              <select v-model="request.requestStatus" @change="updateRequestStatus(request.id, request)">
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </td>
            <td>
              <button @click="updateRequestStatus(request.id, request)" class="update-btn">Update</button>
            </td>
          </tr>
        </tbody>
      </table>
  
      <!-- Display a message if no requests exist -->
      <p v-else class="no-requests-msg">No student requests available.</p>
    </div>
  </template>
  
  <script>
    import axios from 'axios';
    
    export default {
      data() {
        return {
          studentRequests: [],  // List to hold student requests
        };
      },
      methods: {
        // Fetch all student requests from the API
        async fetchStudentRequests() {
          try {
            const response = await axios.get('http://192.168.33.14:8081/api/v1/student-requests/getAllStudentRequests');
            this.studentRequests = response.data;
          } catch (error) {
            console.error('Error fetching student requests:', error);
          }
        },
    
        // Update the status of a student request
        async updateRequestStatus(requestId, request) {
          try {
            // Passing the userId dynamically from the `request.user.id` field
            const userId = request.user.id;  // Getting user ID from the student request
            const response = await axios.put(`http://192.168.33.14:8081/api/v1/student-requests/updateStudentRequest/${requestId}/${userId}`, request);
            
            // Refresh the list with the latest data
            this.fetchStudentRequests();
            
            alert('Request status updated successfully');
          } catch (error) {
            console.error('Error updating request status:', error);
            alert('Failed to update request status');
          }
        }
      },
      created() {
        // Fetch the student requests when the component is created
        this.fetchStudentRequests();
      }
    };
  </script>
  
  <style scoped>
  .student-requests-container {
    font-family: 'Arial', sans-serif;
    padding: 20px;
    background-color: #f4f7f9;
    border-radius: 8px;
  }
  
  .title {
    font-size: 2rem;
    font-weight: bold;
    color: #333;
    text-align: center;
    margin-bottom: 20px;
  }
  
  .requests-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
    background-color: white;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .requests-table th, .requests-table td {
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  
  .requests-table th {
    background-color: #4CAF50;
    color: white;
  }
  
  .requests-table tr:hover {
    background-color: #f1f1f1;
  }
  
  .update-btn {
    padding: 8px 16px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  .update-btn:hover {
    background-color: #45a049;
  }
  
  .no-requests-msg {
    text-align: center;
    font-size: 1.2rem;
    color: #888;
  }
  </style>
  