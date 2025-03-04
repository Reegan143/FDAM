const { expect } = require('chai');
const sinon = require('sinon');
const bcrypt = require('bcrypt');
const UserProfileService = require('../src/services/userProfileServices');
const UserProfileRepository = require('../src/repositories/userProfileRepository');

describe('UserProfileService', () => {
    let userStub;

    beforeEach(() => {
        sinon.restore();
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('getUserProfile', () => {
        it('should return user profile when email is found', async () => {
            const mockUser = { email: 'user@example.com', name: 'John Doe' };
            userStub = sinon.stub(UserProfileRepository, 'getUserByEmail').resolves(mockUser);

            const result = await UserProfileService.getUserProfile('user@example.com');

            expect(result).to.deep.equal(mockUser);
            expect(userStub.calledOnceWith('user@example.com')).to.be.true;
        });

        it('should throw an error if user is not found', async () => {
            userStub = sinon.stub(UserProfileRepository, 'getUserByEmail').resolves(null);

            try {
                await UserProfileService.getUserProfile('user@example.com');
            } catch (error) {
                expect(error.message).to.equal('User not found');
            }
        });
    });

    describe('updateUserProfile', () => {
        it('should update user profile successfully', async () => {
            const mockUpdatedUser = { email: 'user@example.com', name: 'John Updated' };
            userStub = sinon.stub(UserProfileRepository, 'updateUserProfile').resolves(mockUpdatedUser);

            const result = await UserProfileService.updateUserProfile('user@example.com', { name: 'John Updated' });

            expect(result).to.deep.equal(mockUpdatedUser);
            expect(userStub.calledOnceWith('user@example.com', { name: 'John Updated' })).to.be.true;
        });

        it('should throw an error if profile update fails', async () => {
            userStub = sinon.stub(UserProfileRepository, 'updateUserProfile').resolves(null);

            try {
                await UserProfileService.updateUserProfile('user@example.com', { name: 'John Updated' });
            } catch (error) {
                expect(error.message).to.equal('Failed to update profile');
            }
        });
    });
});
