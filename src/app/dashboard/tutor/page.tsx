import Navbar from "@/components/navbar/Navbar"
import ClassCard from "@/components/cards/ClassCard"

export default function TutorDashboard() {

  const classes = [
    {title:"Advanced Level Physics", tutor:"Tharindu Perera", price:500},
    {title:"Advanced Level ICT", tutor:"Nimesh", price:450},
    {title:"Web Development Basics", tutor:"Ravi", price:600},
    {title:"Music Guitar for Beginners", tutor:"Manoj", price:400}
  ]

  return (

    <div className="bg-gray-100 min-h-screen">

      <Navbar />

      <section className="p-10">

        <h1 className="text-3xl font-bold mb-6">
          Tutor Dashboard
        </h1>

        <div className="grid grid-cols-3 gap-6">

          {classes.map((item,index)=>(
            <ClassCard
              key={index}
              title={item.title}
              tutor={item.tutor}
              price={item.price}
            />
          ))}

        </div>

      </section>

    </div>
  )
}