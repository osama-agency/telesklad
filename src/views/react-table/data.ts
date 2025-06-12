export const data = [
  {
    id: 1,
    fullName: 'Иван Иванов',
    email: 'ivan@example.com',
    start_date: '09/23/2016',
    experience: '2 Years',
    age: 28,
    status: 1,
    avatar: '/images/avatars/1.png'
  },
  {
    id: 2,
    fullName: 'Петр Петров',
    email: 'petr@example.com',
    start_date: '11/15/2017',
    experience: '1 Year',
    age: 25,
    status: 2,
    avatar: '/images/avatars/2.png'
  },
  {
    id: 3,
    fullName: 'Мария Сидорова',
    email: 'maria@example.com',
    start_date: '02/01/2018',
    experience: '3 Years',
    age: 30,
    status: 3,
    avatar: '/images/avatars/3.png'
  }
]

export const columns = [
  {
    accessorKey: 'id',
    header: 'ID',
    size: 50
  },
  {
    accessorKey: 'fullName',
    header: 'Имя',
    size: 150
  },
  {
    accessorKey: 'email',
    header: 'Email',
    size: 200
  },
  {
    accessorKey: 'start_date',
    header: 'Дата начала',
    size: 120
  },
  {
    accessorKey: 'experience',
    header: 'Опыт',
    size: 100
  },
  {
    accessorKey: 'age',
    header: 'Возраст',
    size: 80
  },
  {
    accessorKey: 'status',
    header: 'Статус',
    size: 100
  }
]
