export const revenueData = [
  { name: 'Jan', value: 400000 },
  { name: 'Feb', value: 650000 },
  { name: 'Mar', value: 500000 },
  { name: 'Apr', value: 800000 },
  { name: 'May', value: 950000 },
  { name: 'Jun', value: 1250000 },
];

export const userAcquisitionData = [
  { name: 'Jan', students: 400, tutors: 24 },
  { name: 'Feb', students: 300, tutors: 13 },
  { name: 'Mar', students: 200, tutors: 98 },
  { name: 'Apr', students: 278, tutors: 39 },
  { name: 'May', students: 189, tutors: 48 },
  { name: 'Jun', students: 239, tutors: 38 },
];

export const transactions = [
  { id: 'TXN-88291', student: 'Amara Silva', tutor: 'Kasun Perera', amount: 2500.00, comm: '15%', revenue: 375.00, status: 'Success', date: '2024-06-12' },
  { id: 'TXN-88290', student: 'Ruwan Jayasuriya', tutor: 'Nimali Fonseka', amount: 4200.00, comm: '15%', revenue: 630.00, status: 'Pending', date: '2024-06-10' },
  { id: 'TXN-88289', student: 'Dinuka Perera', tutor: 'Sunil Edirisinghe', amount: 1800.00, comm: '20%', revenue: 360.00, status: 'Failed', date: '2024-06-08' },
  { id: 'TXN-88288', student: 'Sachini Perera', tutor: 'Kasun Perera', amount: 3000.00, comm: '15%', revenue: 450.00, status: 'Success', date: '2024-06-05' },
];

export const tutorVerifications = [
  { id: 1, name: 'Aruni Perera', email: 'aruni.p@gmail.com', subject: 'A/L Physics', location: 'Colombo 03', status: 'Pending', date: 'Oct 24, 2023', nicFront: 'NIC_Front.jpg', credentials: 'BSc Physics_FirstClass.pdf' },
  { id: 2, name: 'Sajith Silva', email: 'sajith.math@tutor.lk', subject: 'O/L Maths', location: 'Kandy', status: 'Verified', date: 'Oct 22, 2023', nicFront: 'NIC_Front.jpg', credentials: 'BSc Maths.pdf' },
  { id: 3, name: 'Mahesh Senanayake', email: 'mahesh.s@uni.lk', subject: 'Information Tech', location: 'Galle', status: 'Missing Docs', date: 'Oct 20, 2023', nicFront: '', credentials: '' },
  { id: 4, name: 'Nimali Fonseka', email: 'nimali.f@teacher.lk', subject: 'A/L Chemistry', location: 'Colombo 07', status: 'Pending', date: 'Oct 23, 2023', nicFront: 'NIC_Front.jpg', credentials: 'MSc Chemistry.pdf' },
  { id: 5, name: 'Sunil Edirisinghe', email: 'sunil.e@tutor.lk', subject: 'O/L Science', location: 'Kurunegala', status: 'Verified', date: 'Oct 21, 2023', nicFront: 'NIC_Front.jpg', credentials: 'BSc Science.pdf' },
];

export const pendingAds = [
  { id: 1, tutor: 'Kasun Perera', title: 'Advanced Pure Maths (A/L)', desc: 'Master the complex concepts of Pure Mathematics with personalized guidance.', price: 'Rs. 499', time: '2h ago' },
  { id: 2, tutor: 'Dilini Silva', title: 'Graphic Design Basics', desc: 'Learn Adobe Photoshop, Illustrator and the principles of design from scratch.', price: 'Rs. 499', time: '5h ago' },
  { id: 3, tutor: 'Asanka Kumara', title: 'Python for Data Science', desc: 'Comprehensive Python course covering NumPy, Pandas, and Matplotlib.', price: 'Rs. 499', time: '1d ago' },
];