import { createRouter, createWebHistory } from 'vue-router'
import Login from './components/Login.vue'
import Committee from './components/committee/Committee.vue'
import Admin from './components/admin/Admin.vue'
import Courses from './components/admin/Courses.vue'
import Department from './components/admin/Department.vue'
import ExamHole from './components/admin/ExamHole.vue'
import ExamSchedule from './components/admin/ExamSchedule.vue'
import SemesterSchedule from './components/admin/SemesterSchedule.vue'
import Users from './components/admin/Users.vue'
import StudentRequest from './components/admin/StudentRequest.vue'
const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    children:[
      {
        path: '',  // Default child route
        component: Department,  // Default to Department
      },
      {
        path: 'department',
        name: "Department",
        component: Department,
      },
      {
        path: 'users',
        name: "Users",
        component: Users,
      },
      {
        path: 'courses',
        name: "Courses",
        component: Courses,
      },
      {
        path: 'exam-hole',
        name: "ExamHole",
        component: ExamHole,
      },
      {
        path: 'exam-schedule',
        name:"ExamSchedule",
        component: ExamSchedule,
      },
      {
        path: 'semester-schedule',
        name:"SemesterSchedule",
        component: SemesterSchedule,
      },
      {
        path:"student-requests",
        name: "StudentRequest",
        component: StudentRequest
      }
    ]
  },
  {
    path: '/committee',
    name: 'Committee',
    component: Committee,
  },
  

]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router