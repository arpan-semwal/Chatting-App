

const Avatar = ({userId , username}) => {
    const colors = ['bg-red-400' , 'bg-green-200' ,'bg-purple-200' , 'bg-yellow-300' , 'bg-green-300', 'bg-teal-200'];
    const userIdBase10 = parseInt(userId , 16);
    const colorIndex = userIdBase10 % colors.length;
    const color = colors[colorIndex];


  return (
    <div>
        <div className={"w-8 h-8 rounded-full flex items-center " + color}>
        <div className="text-center w-full opacity-70">{username[0]}</div>
    </div>

    </div>
  )
}

export default Avatar
