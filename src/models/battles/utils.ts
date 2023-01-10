const availableChatRooms = ['room1', 'room2', 'room3', 'room4', 'room5'];

function chooseRandomChatRoom() {
  const index = Math.floor(Math.random() * availableChatRooms.length);
  return availableChatRooms[index];
}
