import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Search, 
  MessageCircle, 
  Users, 
  Send,
  GraduationCap,
  MapPin,
  Building2,
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
import API from '../../../utils/api';
import useAuth from '../../../hooks/useAuth';
import { getOtherParticipant } from '../../../utils/chatParticipant';

const OrganizationCommunication = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [students, setStudents] = useState([]);
  const [organizationMembers, setOrganizationMembers] = useState([]);
  const [allOrganizations, setAllOrganizations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileView, setMobileView] = useState('sidebar');
  const [activeTab, setActiveTab] = useState('chats');
  const [currentUserObjectId, setCurrentUserObjectId] = useState(null);
  const [showNewChat, setShowNewChat] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  const messagesEndRef = useRef(null);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchCurrentUserObjectId = async () => {
    try {
      const response = await API.get(`/users/uid/${user.uid}`);
      const appUser = response.data;
      const objectId = appUser?._id || null;
      setCurrentUserObjectId(objectId);
      return objectId;
    } catch (error) {
      console.error("Error fetching organization object id:", error);
      setCurrentUserObjectId(null);
      return null;
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await API.get(`/conversations/user/${user.uid}`);
      setConversations(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setConversations([]);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await API.get('/students');
      setStudents(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    }
  };

  const fetchOrganizationMembers = async () => {
    try {
      if (!currentUserObjectId) return;
      
      const response = await API.get(`/organizations/${currentUserObjectId}/members`);
      setOrganizationMembers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching organization members:', error);
      setOrganizationMembers([]);
    }
  };

  const fetchAllOrganizations = async () => {
    try {
      const response = await API.get("/organizations");
      const organizationsData = Array.isArray(response.data) ? response.data : [];

      const filtered = organizationsData.filter(
        (org) => String(org._id) !== String(currentUserObjectId)
      );

      setAllOrganizations(filtered);
    } catch (error) {
      console.error("Error fetching organizations:", error);
      setAllOrganizations([]);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await API.get(`/conversations/${conversationId}/messages`);
      setMessages(Array.isArray(response.data) ? response.data : []);

      const socket = socketService.getSocket();
      if (socket && conversationId && currentUserObjectId) {
        socket.emit("mark_as_read", {
          conversationId,
          userId: currentUserObjectId,
        });
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    }
  };

  const joinConversation = (conversationId) => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit("join_conversation", conversationId);
    }
  };

  const handleNewMessage = useCallback((message) => {
    const normalizedConversationId =
      typeof message.conversationId === "object" &&
      message.conversationId !== null &&
      "$oid" in message.conversationId
        ? message.conversationId.$oid
        : String(message.conversationId);

    const selectedConversationId = selectedConversation?._id
      ? String(selectedConversation._id)
      : null;

    if (
      selectedConversationId &&
      normalizedConversationId === selectedConversationId
    ) {
      setMessages((prev) => [...prev, message]);

      setConversations((prev) =>
        prev.map((conv) =>
          String(conv._id) === normalizedConversationId
            ? {
                ...conv,
                lastMessage: message.text,
                lastMessageTime: message.timestamp,
                unreadCount:
                  String(conv._id) === selectedConversationId
                    ? 0
                    : (conv.unreadCount || 0) + 1,
              }
            : conv
        )
      );
    } else {
      setConversations((prev) =>
        prev.map((conv) =>
          String(conv._id) === normalizedConversationId
            ? {
                ...conv,
                lastMessage: message.text,
                lastMessageTime: message.timestamp,
                unreadCount: (conv.unreadCount || 0) + 1,
              }
            : conv
        )
      );
    }
  }, [selectedConversation]);

  const handleMessagesRead = useCallback(() => {}, []);

  useEffect(() => {
    const socket = socketService.connect();

    socket.on("connect", () => {
      console.log("✅ Socket connected");
      setSocketConnected(true);

      if (selectedConversation?._id) {
        socket.emit("join_conversation", selectedConversation._id);
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setSocketConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setSocketConnected(false);
    });

    socket.on("receive_message", handleNewMessage);
    socket.on("messages_read", handleMessagesRead);

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("receive_message", handleNewMessage);
      socket.off("messages_read", handleMessagesRead);
    };
  }, [handleNewMessage, handleMessagesRead, selectedConversation]);

  useEffect(() => {
    const init = async () => {
      if (!user?.uid) return;

      const objectId = await fetchCurrentUserObjectId();
      if (!objectId) return;

      await Promise.all([
        fetchConversations(),
        fetchStudents(),
        fetchOrganizationMembers(),
        fetchAllOrganizations(),
      ]);
    };

    init();
  }, [user]);

  useEffect(() => {
    if (selectedConversation?._id) {
      fetchMessages(selectedConversation._id);
      joinConversation(selectedConversation._id);

      if (isMobile) {
        setMobileView("chat");
      }
    }
  }, [selectedConversation, currentUserObjectId, isMobile]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startNewChat = async (targetUser) => {
    try {
      setLoading(true);

      if (!currentUserObjectId) {
        throw new Error("Organization ID not found");
      }

      const response = await API.post("/conversations", {
        participantAId: currentUserObjectId,
        participantBId: targetUser._id,
      });

      const conversation = response.data;

      setSelectedConversation(conversation);
      setShowNewChat(false);
      setSearchTerm("");
      setActiveTab("chats");

      setConversations((prev) => {
        const exists = prev.find((conv) => String(conv._id) === String(conversation._id));
        return exists ? prev : [conversation, ...prev];
      });
    } catch (error) {
      console.error("Error starting new chat:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    const socket = socketService.getSocket();

    if (
      !newMessage.trim() ||
      !selectedConversation ||
      !socket ||
      !currentUserObjectId
    ) {
      return;
    }

    const messageData = {
      conversationId: selectedConversation._id,
      senderId: currentUserObjectId,
      senderName: user.displayName || user.name,
      senderRole: "organization",
      senderPhoto: user.photoURL,
      text: newMessage.trim(),
    };

    socket.emit("send_message", messageData);
    setNewMessage("");
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatJoinDate = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  // Filter conversations for chat tab
  const filteredConversations = conversations.filter((conv) => {
    const other = getOtherParticipant(conv, currentUserObjectId);
    if (!other) return false;

    return (
      other.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      other.meta?.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      other.meta?.campus?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      other.meta?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      other.meta?.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      other.meta?.studentId?.includes(searchTerm)
    );
  });

  // Filter members for members tab
  const filteredMembers = organizationMembers.filter(member =>
    member.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.studentInfo?.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.studentInfo?.studentId?.includes(searchTerm)
  );

  // Filter organizations for organizations tab
  const filteredOrganizationsList = allOrganizations.filter(
    (org) =>
      org.organization?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.organization?.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.organization?.campus?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const selectedOtherParticipant = selectedConversation
    ? getOtherParticipant(selectedConversation, currentUserObjectId)
    : null;

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
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-900">Communication</h2>
                    <div className="flex items-center gap-1 text-xs">
                      <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className={socketConnected ? 'text-green-600' : 'text-red-600'}>
                        {socketConnected ? '' : 'Offline'}
                      </span>
                    </div>
                  </div>
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
                  <button
                    onClick={() => setActiveTab('organizations')}
                    className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      activeTab === 'organizations'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Orgs
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
                        : activeTab === 'members'
                        ? "Search members..."
                        : "Search organizations..."
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
                      {filteredConversations.map((conversation, index) => {
                        const other = getOtherParticipant(conversation, currentUserObjectId);
                        if (!other) return null;

                        return (
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
                                  src={other.photo || `https://ui-avatars.com/api/?name=${other.name}&background=4bbeff&color=fff`}
                                  alt={other.name}
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
                                    {other.name}
                                  </h3>
                                  <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                    {conversation.lastMessageTime ? formatTime(conversation.lastMessageTime) : ''}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 truncate mt-1">
                                  {conversation.lastMessage || 'No messages yet'}
                                </p>
                                <div className="flex items-center gap-1 mt-1">
                                  {other.meta?.studentId ? (
                                    <>
                                      <GraduationCap className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                      <span className="text-xs text-gray-500 truncate">
                                        {other.meta.studentId} • {other.meta.department}
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <Building2 className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                      <span className="text-xs text-gray-500 truncate">
                                        {other.meta?.type || other.role}
                                      </span>
                                      {other.meta?.campus && (
                                        <>
                                          <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                          <span className="text-xs text-gray-500 truncate">
                                            {other.meta.campus}
                                          </span>
                                        </>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>

                    {filteredConversations.length === 0 && (
                      <div className="text-center py-8 px-4">
                        <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No conversations found</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Start a conversation with your members or other organizations
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
                      {filteredMembers.map((member, index) => {
                        // Find existing conversation by userId
                        const existingConv = conversations.find((conv) => {
                          const other = getOtherParticipant(conv, currentUserObjectId);
                          return String(other?.userId) === String(member.studentId);
                        });

                        return (
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
                                      if (existingConv) {
                                        setSelectedConversation(existingConv);
                                        if (isMobile) setMobileView('chat');
                                      } else {
                                        // Create student object to start chat
                                        const student = {
                                          _id: member.studentId,
                                          name: member.studentName,
                                          email: member.studentEmail,
                                          photoURL: member.studentPhoto,
                                          meta: member.studentInfo
                                        };
                                        startNewChat(student);
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
                        );
                      })}
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

                {/* Organizations Tab */}
                {activeTab === 'organizations' && (
                  <div>
                    <div className="p-3 bg-green-50 border-b border-green-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-900">
                          Other Organizations
                        </span>
                        <span className="text-lg font-bold text-green-600">
                          {allOrganizations.length}
                        </span>
                      </div>
                    </div>

                    <AnimatePresence>
                      {filteredOrganizationsList.map((org, index) => {
                        // Find existing conversation by userId
                        const existingConv = conversations.find((conv) => {
                          const other = getOtherParticipant(conv, currentUserObjectId);
                          return String(other?.userId) === String(org._id);
                        });

                        return (
                          <motion.div
                            key={org._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-3 border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 group"
                          >
                            <div className="flex items-center space-x-3">
                              <img
                                src={org.photoURL || `https://ui-avatars.com/api/?name=${org.organization?.name || org.name}&background=4bbeff&color=fff`}
                                alt={org.organization?.name || org.name}
                                className="w-12 h-12 rounded-xl object-cover"
                              />
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-semibold text-gray-900 text-sm truncate">
                                    {org.organization?.name || org.name}
                                  </h3>
                                </div>
                                
                                <div className="flex items-center gap-2 mt-1">
                                  <Mail className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-500 truncate">
                                    {org.email}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-2 mt-1">
                                  <Building2 className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-500">
                                    {org.organization?.type}
                                  </span>
                                  {org.organization?.campus && (
                                    <>
                                      <MapPin className="w-3 h-3 text-gray-400" />
                                      <span className="text-xs text-gray-500">
                                        {org.organization.campus}
                                      </span>
                                    </>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 mt-2">
                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                      if (existingConv) {
                                        setSelectedConversation(existingConv);
                                        if (isMobile) setMobileView('chat');
                                      } else {
                                        startNewChat(org);
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
                        );
                      })}
                    </AnimatePresence>

                    {filteredOrganizationsList.length === 0 && (
                      <div className="text-center py-8 px-4">
                        <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No organizations found</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {searchTerm ? 'Try adjusting your search' : 'No other organizations available'}
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
                <button
                  onClick={() => {
                    setActiveTab('organizations');
                    setSidebarOpen(true);
                  }}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    activeTab === 'organizations' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Building2 className="w-5 h-5" />
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
                      src={selectedOtherParticipant?.photo || `https://ui-avatars.com/api/?name=${selectedOtherParticipant?.name || "User"}&background=4bbeff&color=fff`}
                      alt={selectedOtherParticipant?.name || "User"}
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {selectedOtherParticipant?.name || "Unknown User"}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        {selectedOtherParticipant?.meta?.studentId ? (
                          <>
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              <span>ID: {selectedOtherParticipant.meta.studentId}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <GraduationCap className="w-3 h-3" />
                              <span>{selectedOtherParticipant.meta.department}</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              <span>{selectedOtherParticipant?.meta?.type || selectedOtherParticipant?.role}</span>
                            </div>
                            {selectedOtherParticipant?.meta?.campus && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{selectedOtherParticipant.meta.campus}</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-xs justify-end mb-1">
                      <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className={socketConnected ? 'text-green-600' : 'text-red-600'}>
                        {socketConnected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-xs text-green-600 mt-1">Online</p>
                  </div>
                </div>
              </div>

              {/* Messages Area - Scrollable */}
              <div className="flex-1 overflow-y-auto bg-gray-50/50 p-4">
                <div className="space-y-3 max-w-4xl mx-auto">
                  {messages.map((message, index) => {
                    const isOwnMessage = String(message.senderId) === String(currentUserObjectId);
                    
                    return (
                      <motion.div
                        key={message._id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md rounded-2xl p-3 ${
                            isOwnMessage
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-br-none'
                              : 'bg-white text-gray-900 rounded-bl-none shadow-sm border border-gray-200'
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{message.text}</p>
                          <div className={`flex items-center justify-end space-x-1 mt-2 text-xs ${
                            isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            <span>{formatTime(message.timestamp)}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No messages yet</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Start a conversation with {selectedOtherParticipant?.name || "this user"}
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
                    disabled={!newMessage.trim() || !socketConnected}
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
                  {activeTab === 'chats' ? 'Select a conversation' : 
                   activeTab === 'members' ? 'Organization Members' : 'Other Organizations'}
                </h3>
                <p className="text-gray-500 text-sm">
                  {activeTab === 'chats' 
                    ? 'Choose a conversation from the list to start messaging'
                    : activeTab === 'members'
                    ? 'Manage and communicate with your organization members'
                    : 'Connect and collaborate with other organizations'
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
                    placeholder="Search students or organizations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-sm"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {/* Students Section */}
                <div className="p-3 bg-gray-50 border-b border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700">Students</h4>
                </div>
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

                {/* Organizations Section */}
                <div className="p-3 bg-gray-50 border-b border-gray-200 mt-2">
                  <h4 className="text-sm font-semibold text-gray-700">Organizations</h4>
                </div>
                {allOrganizations
                  .filter(org =>
                    org.organization?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    org.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    org.email?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((org) => (
                  <motion.button
                    key={org._id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => startNewChat(org)}
                    disabled={loading}
                    className="w-full p-3 border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={org.photoURL || `https://ui-avatars.com/api/?name=${org.organization?.name || org.name}&background=4bbeff&color=fff`}
                        alt={org.organization?.name || org.name}
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm text-left">
                          {org.organization?.name || org.name}
                        </h4>
                        <p className="text-xs text-gray-500 text-left">{org.email}</p>
                        {org.organization && (
                          <div className="flex items-center gap-2 mt-1">
                            <Building2 className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {org.organization.type}
                            </span>
                            {org.organization.campus && (
                              <>
                                <MapPin className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                  {org.organization.campus}
                                </span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))}

                {students.filter(student => 
                  !organizationMembers.some(member => member.studentEmail === student.email)
                ).length === 0 && allOrganizations.length === 0 && (
                  <div className="text-center py-8">
                    <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No users found</p>
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