import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MessageCircle, 
  Users, 
  Send,
  GraduationCap,
  MapPin,
  User,
  ChevronLeft,
  Menu,
  Mail,
  Phone,
  Calendar,
  Shield,
  Crown,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import socketService from '../../../utils/Socket';
import axios from 'axios';
import useAuth from '../../../hooks/useAuth';

const OrganizationCommunication = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [students, setStudents] = useState([]);
  const [organizationMembers, setOrganizationMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileView, setMobileView] = useState('sidebar');
  const [activeTab, setActiveTab] = useState('chats');
  const [organizationId, setOrganizationId] = useState(null);
  const [showNewChat, setShowNewChat] = useState(false);
  const messagesEndRef = useRef(null);

  const socket = socketService.getSocket();

  useEffect(() => {
    socketService.connect();
    
    return () => {
      socketService.disconnect();
    };
  }, []);

  useEffect(() => {
    if (user) {
      fetchOrganizationId();
    }
  }, [user]);

  useEffect(() => {
    if (organizationId) {
      fetchConversations();
      fetchStudents();
      fetchOrganizationMembers();
    }
  }, [organizationId]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
      joinConversation(selectedConversation._id);
      if (window.innerWidth < 1024) {
        setMobileView('chat');
      }
    }
  }, [selectedConversation]);

  useEffect(() => {
    if (socket) {
      socket.on('receive_message', handleNewMessage);
      socket.on('messages_read', handleMessagesRead);

      return () => {
        socket.off('receive_message', handleNewMessage);
        socket.off('messages_read', handleMessagesRead);
      };
    }
  }, [socket, selectedConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get organization MongoDB ID first
  const fetchOrganizationId = async () => {
    try {
      // console.log('Fetching organization ID for:', user.email);
      const response = await axios.get(`http://localhost:3000/users/uid/${user.uid}`);
      if (response.data.success) {
        setOrganizationId(response.data.user._id);
        // console.log('Organization ID:', response.data.user._id);
      }
    } catch (error) {
      console.error('Error fetching organization ID:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/conversations/${user.uid}`);
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:3000/students');
      setStudents(response.data.students);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchOrganizationMembers = async () => {
    try {
      if (!organizationId) return;
      
      // console.log('Fetching members for organization ID:', organizationId);
      
      // Use the organization ID to fetch members
      const response = await axios.get(`http://localhost:3000/organizations/email/${user.email}/members`);
      // console.log('Members fetched:', response.data.members);
      setOrganizationMembers(response.data.members);
    } catch (error) {
      console.error('Error fetching organization members:', error);
      setOrganizationMembers([]);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await axios.get(`http://localhost:3000/conversations/${conversationId}/messages`);
      setMessages(response.data.messages);
      
      if (socket && conversationId) {
        socket.emit('mark_as_read', {
          conversationId,
          userId: user.uid
        });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const joinConversation = (conversationId) => {
    if (socket) {
      socket.emit('join_conversation', conversationId);
    }
  };

  const handleNewMessage = (message) => {
    if (selectedConversation && message.conversationId === selectedConversation._id) {
      setMessages(prev => [...prev, message]);
      
      setConversations(prev => 
        prev.map(conv => 
          conv._id === message.conversationId 
            ? { 
                ...conv, 
                lastMessage: message.text,
                lastMessageTime: message.timestamp,
                unreadCount: conv._id === selectedConversation._id ? 0 : conv.unreadCount + 1
              }
            : conv
        )
      );
    } else {
      setConversations(prev => 
        prev.map(conv => 
          conv._id === message.conversationId 
            ? { ...conv, unreadCount: (conv.unreadCount || 0) + 1 }
            : conv
        )
      );
    }
  };

  const handleMessagesRead = (data) => {
    // Handle read receipts
  };

  const startNewChat = async (student) => {
    try {
      setLoading(true);
      
      // Get student MongoDB _id from their Firebase UID
      const studentResponse = await axios.get(`http://localhost:3000/users/uid/${student.uid}`);
      const studentMongoId = studentResponse.data.user._id;

      const response = await axios.post('http://localhost:3000/conversations', {
        studentId: studentMongoId,
        organizationId: organizationId
      });

      setSelectedConversation(response.data.conversation);
      setShowNewChat(false);
      setSearchTerm('');
      setActiveTab('chats');
      
      if (!conversations.find(conv => conv._id === response.data.conversation._id)) {
        setConversations(prev => [response.data.conversation, ...prev]);
      }
    } catch (error) {
      console.error('Error starting new chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !socket || !organizationId) return;

    const messageData = {
      conversationId: selectedConversation._id,
      senderId: organizationId,
      senderName: user.organization?.name || user.name,
      senderRole: 'organization',
      senderPhoto: user.photoURL,
      text: newMessage.trim()
    };

    socket.emit('send_message', messageData);
    setNewMessage('');
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatJoinDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  // Filter conversations for chat tab
  const filteredConversations = conversations.filter(conv =>
    conv.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.studentInfo?.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.studentInfo?.studentId?.includes(searchTerm)
  );

  // Filter members for members tab
  const filteredMembers = organizationMembers.filter(member =>
    member.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.studentInfo?.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.studentInfo?.studentId?.includes(searchTerm)
  );

  const getMemberRoleBadge = (member) => {
    if (member.role === 'admin') {
      return (
        <div className="flex items-center gap-1 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
          <Crown className="w-3 h-3" />
          Admin
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
        <Shield className="w-3 h-3" />
        Member
      </div>
    );
  };

  const isMobile = window.innerWidth < 1024;

  return (
    <div className="h-full bg-gray-50">
      <div className="flex h-full max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Sidebar - Fixed */}
        <div className={`
          ${sidebarOpen ? 'w-80' : 'w-20'} 
          flex-shrink-0 border-r border-gray-200 bg-white 
          transition-all duration-300 ease-in-out
          ${isMobile && mobileView === 'chat' ? 'hidden' : 'flex flex-col'}
        `}>
          {/* Sidebar Header - Fixed */}
          <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
            <div className="flex items-center justify-between">
              {sidebarOpen ? (
                <>
                  <h2 className="text-xl font-bold text-gray-900">Communication</h2>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowNewChat(true)}
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Plus className="w-4 h-4" />
                    </motion.button>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 mx-auto">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowNewChat(true)}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Menu className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              )}
            </div>
            
            {sidebarOpen && (
              <>
                {/* Tabs */}
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mt-4">
                  <button
                    onClick={() => setActiveTab('chats')}
                    className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      activeTab === 'chats'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Chats
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('members')}
                    className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      activeTab === 'members'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Users className="w-4 h-4" />
                      Members
                      <span className="bg-blue-100 text-blue-600 text-xs px-1.5 py-0.5 rounded-full">
                        {organizationMembers.length}
                      </span>
                    </div>
                  </button>
                </div>

                {/* Search Bar */}
                <div className="mt-3 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder={
                      activeTab === 'chats' 
                        ? "Search conversations..." 
                        : "Search members..."
                    }
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-sm"
                  />
                </div>
              </>
            )}
          </div>

          {/* Content Area - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            {sidebarOpen ? (
              <>
                {/* Chats Tab */}
                {activeTab === 'chats' && (
                  <div>
                    <AnimatePresence>
                      {filteredConversations.map((conversation, index) => (
                        <motion.div
                          key={conversation._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => {
                            setSelectedConversation(conversation);
                            if (isMobile) setMobileView('chat');
                          }}
                          className={`p-3 border-b border-gray-100 cursor-pointer transition-all duration-200 group ${
                            selectedConversation?._id === conversation._id
                              ? 'bg-blue-50 border-blue-200'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="relative flex-shrink-0">
                              <img
                                src={conversation.studentPhoto || `https://ui-avatars.com/api/?name=${conversation.studentName}&background=4bbeff&color=fff`}
                                alt={conversation.studentName}
                                className="w-12 h-12 rounded-xl object-cover"
                              />
                              {conversation.unreadCount > 0 && (
                                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                  {conversation.unreadCount}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900 text-sm truncate">
                                  {conversation.studentName}
                                </h3>
                                <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                  {conversation.lastMessageTime ? formatTime(conversation.lastMessageTime) : ''}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 truncate mt-1">
                                {conversation.lastMessage || 'No messages yet'}
                              </p>
                              <div className="flex items-center gap-1 mt-1">
                                <GraduationCap className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                <span className="text-xs text-gray-500 truncate">
                                  {conversation.studentInfo?.studentId} • {conversation.studentInfo?.department}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {filteredConversations.length === 0 && (
                      <div className="text-center py-8 px-4">
                        <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No conversations found</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Start a conversation with your members
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Members Tab */}
                {activeTab === 'members' && (
                  <div>
                    <div className="p-3 bg-blue-50 border-b border-blue-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-900">
                          Total Members
                        </span>
                        <span className="text-lg font-bold text-blue-600">
                          {organizationMembers.length}
                        </span>
                      </div>
                    </div>

                    <AnimatePresence>
                      {filteredMembers.map((member, index) => (
                        <motion.div
                          key={member._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-3 border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 group"
                        >
                          <div className="flex items-center space-x-3">
                            <img
                              src={member.studentPhoto || `https://ui-avatars.com/api/?name=${member.studentName}&background=4bbeff&color=fff`}
                              alt={member.studentName}
                              className="w-12 h-12 rounded-xl object-cover"
                            />
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900 text-sm truncate">
                                  {member.studentName}
                                </h3>
                                {getMemberRoleBadge(member)}
                              </div>
                              
                              <div className="flex items-center gap-2 mt-1">
                                <Mail className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500 truncate">
                                  {member.studentEmail}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2 mt-1">
                                <GraduationCap className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                  {member.studentInfo?.studentId} • {member.studentInfo?.department}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 mt-1">
                                <Calendar className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                  Joined {formatJoinDate(member.joinedAt)}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 mt-2">
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => {
                                    // Find or create conversation with this member
                                    const existingConv = conversations.find(
                                      conv => conv.studentName === member.studentName
                                    );
                                    if (existingConv) {
                                      setSelectedConversation(existingConv);
                                      if (isMobile) setMobileView('chat');
                                    } else {
                                      // Find the student in the students list to get their UID
                                      const student = students.find(s => s.email === member.studentEmail);
                                      if (student) {
                                        startNewChat(student);
                                      }
                                    }
                                  }}
                                  className="text-xs bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors duration-200"
                                >
                                  Message
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {filteredMembers.length === 0 && (
                      <div className="text-center py-8 px-4">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No members found</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {searchTerm ? 'Try adjusting your search' : 'No members have joined yet'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              // Collapsed sidebar view
              <div className="flex flex-col items-center py-4 space-y-4">
                <button
                  onClick={() => {
                    setActiveTab('chats');
                    setSidebarOpen(true);
                  }}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    activeTab === 'chats' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setActiveTab('members');
                    setSidebarOpen(true);
                  }}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    activeTab === 'members' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Users className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area - Flexible */}
        <div className={`
          flex-1 flex flex-col
          ${isMobile && mobileView === 'sidebar' ? 'hidden' : 'flex'}
        `}>
          {selectedConversation ? (
            <>
              {/* Chat Header - Fixed */}
              <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {isMobile && (
                      <button
                        onClick={() => setMobileView('sidebar')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-2"
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                      </button>
                    )}
                    <img
                      src={selectedConversation.studentPhoto || `https://ui-avatars.com/api/?name=${selectedConversation.studentName}&background=4bbeff&color=fff`}
                      alt={selectedConversation.studentName}
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {selectedConversation.studentName}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>ID: {selectedConversation.studentInfo?.studentId}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <GraduationCap className="w-3 h-3" />
                          <span>{selectedConversation.studentInfo?.department}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages Area - Scrollable */}
              <div className="flex-1 overflow-y-auto bg-gray-50/50 p-4">
                <div className="space-y-3 max-w-4xl mx-auto">
                  {messages.map((message, index) => (
                    <motion.div
                      key={message._id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.senderRole === 'organization' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md rounded-2xl p-3 ${
                          message.senderRole === 'organization'
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-br-none'
                            : 'bg-white text-gray-900 rounded-bl-none shadow-sm border border-gray-200'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.text}</p>
                        <div className={`flex items-center justify-end space-x-1 mt-2 text-xs ${
                          message.senderRole === 'organization' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          <span>{formatTime(message.timestamp)}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No messages yet</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Start a conversation with {selectedConversation.studentName}
                    </p>
                  </div>
                )}
              </div>

              {/* Message Input - Fixed */}
              <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
                <form onSubmit={sendMessage} className="flex space-x-3 max-w-4xl mx-auto">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-sm"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50/50">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {activeTab === 'chats' ? 'Select a conversation' : 'Organization Members'}
                </h3>
                <p className="text-gray-500 text-sm">
                  {activeTab === 'chats' 
                    ? 'Choose a conversation from the list to start messaging'
                    : 'Manage and communicate with your organization members'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      <AnimatePresence>
        {showNewChat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col"
            >
              <div className="p-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">New Chat</h3>
                  <button
                    onClick={() => {
                      setShowNewChat(false);
                      setSearchTerm('');
                    }}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    ✕
                  </button>
                </div>
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-sm"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {students
                  .filter(student => 
                    !organizationMembers.some(member => member.studentEmail === student.email)
                  )
                  .filter(student =>
                    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    student.student?.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    student.student?.studentId?.includes(searchTerm)
                  )
                  .map((student) => (
                  <motion.button
                    key={student._id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => startNewChat(student)}
                    disabled={loading}
                    className="w-full p-3 border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={student.photoURL || `https://ui-avatars.com/api/?name=${student.name}&background=4bbeff&color=fff`}
                        alt={student.name}
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm text-left">
                          {student.name}
                        </h4>
                        <p className="text-xs text-gray-500 text-left">{student.email}</p>
                        {student.student && (
                          <div className="flex items-center gap-2 mt-1">
                            <GraduationCap className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {student.student.studentId} • {student.student.department}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))}

                {students.filter(student => 
                  !organizationMembers.some(member => member.studentEmail === student.email)
                ).length === 0 && (
                  <div className="text-center py-8">
                    <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No students found</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrganizationCommunication;