import React from "react";
import CreateEventForm from "../../../components/forms/CreateEventForm";

const EventCreation = () => {
  const handleCreateEvent = async (formData) => {
    try {
      const form = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null) form.append(key, formData[key]);
      });

      const res = await fetch("/api/events", {
        method: "POST",
        body: form,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, 
        },
      });

      if (!res.ok) throw new Error("Failed to create event");

      alert("🎉 Event created successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Error creating event. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-base-200 pb-10 px-4">
      <div className=" mx-auto">
        

        <CreateEventForm onSubmit={handleCreateEvent} />
      </div>
    </div>
  );
};

export default EventCreation;
