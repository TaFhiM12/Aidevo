import React from 'react';
import useUserRole from '../../../../hooks/useUserRole';
import BloodBankEventCreation from './BloodBankEventCreation';
import DebateClubEventCreation from './DebateClubEventCreation';
import AssociationEventCreation from './AssociationEventCreation';

const EventCreationRoot = () => {
    const { userInfo } = useUserRole();
    
    // Check if user is organization and determine type
    if (userInfo?.role !== "organization") {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h1>
                <p className="text-gray-600">Only organizations can create events.</p>
            </div>
        </div>;
    }

    // Determine organization type and render appropriate component
    const orgName = userInfo?.organizationName?.toLowerCase() || '';
    console.log(orgName)
    
    if (orgName.includes('blood') || orgName === 'Just blood bank') {
        return <BloodBankEventCreation />;
    } else if (orgName.includes('debate') || orgName === 'just debate club') {
        return <DebateClubEventCreation />;
    } else if (userInfo?.organizationType === 'association' || orgName.includes('association')) {
        return <AssociationEventCreation />;
    } else {
        // Default event creation for other organizations
        return (
            <div className="min-h-screen bg-gray-50 pb-10 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg shadow-sm p-6 mt-6 border-l-4 border-purple-500">
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            🎯 Create Event
                        </h1>
                        <p className="text-gray-600">
                            Organize an event for your organization
                        </p>
                    </div>
                    {/* You can import and use your general EventCreation component here */}
                </div>
            </div>
        );
    }
};

export default EventCreationRoot;