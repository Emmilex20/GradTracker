import React from 'react';
import ConnectionsList from '../components/ConnectionsList'; // A component to show user connections
import GroupsList from '../components/GroupsList'; // A component to show user groups
import UserSearch from '../components/UserSearch'; // A component to search for users

const SocialHubPage: React.FC = () => {
    return (
        <div className="container mx-auto p-4 mt-24">
            <h1 className="text-4xl font-bold mb-8">Social Hub</h1>
            
            {/* User Search Section */}
            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Find New Connections</h2>
                <UserSearch />
            </section>
            
            {/* Connections Section */}
            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Your Connections</h2>
                <ConnectionsList />
            </section>
            
            {/* Groups Section */}
            <section>
                <h2 className="text-2xl font-semibold mb-4">Your Groups</h2>
                <GroupsList />
            </section>
        </div>
    );
};

export default SocialHubPage;