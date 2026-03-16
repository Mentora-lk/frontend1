type Props = {
    title: string
    tutor: string
    price: number
  }
  
  export default function ClassCard({title, tutor, price}: Props) {
    return (
  
      <div className="bg-white shadow rounded-lg p-4">
  
        <img
          src="/class.jpg"
          className="rounded mb-3"
        />
  
        <h3 className="font-semibold text-lg">
          {title}
        </h3>
  
        <p className="text-gray-500">
          {tutor}
        </p>
  
        <p className="text-green-600 font-bold">
          LKR {price}
        </p>
  
      </div>
    )
  }