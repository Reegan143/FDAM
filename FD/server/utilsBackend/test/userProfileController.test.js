const { expect } = require('chai');
const sinon = require('sinon');
const UserProfileController = require('../src/controllers/userProfileController');
const UserProfileService = require('../src/services/userProfileServices');

describe('UserProfileController', () => {
    let req, res, profileStub;

    beforeEach(() => {
        req = { user: { email: 'user@example.com' }, body: {} };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
        };
        sinon.restore();
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('getUserProfile', () => {
        it('should return user profile successfully', async () => {
            const mockUser = { email: 'user@example.com', name: 'John Doe' };
            profileStub = sinon.stub(UserProfileService, 'getUserProfile').resolves(mockUser);

            await UserProfileController.getUserProfile(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith(mockUser)).to.be.true;
        });

        it('should handle errors when fetching user profile', async () => {
            profileStub = sinon.stub(UserProfileService, 'getUserProfile').throws(new Error('Profile fetch error'));

            await UserProfileController.getUserProfile(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith({ message: 'Error fetching user profile', error: 'Profile fetch error' })).to.be.true;
        });
    });

    describe('updateUserProfile', () => {
        it('should update user profile successfully', async () => {
            const mockUpdatedUser = { email: 'user@example.com', name: 'John Updated' };
            profileStub = sinon.stub(UserProfileService, 'updateUserProfile').resolves(mockUpdatedUser);

            await UserProfileController.updateUserProfile(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith({ message: 'Profile updated successfully', user: mockUpdatedUser })).to.be.true;
        });

        it('should handle errors when updating user profile', async () => {
            profileStub = sinon.stub(UserProfileService, 'updateUserProfile').throws(new Error('Profile update error'));

            await UserProfileController.updateUserProfile(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith({ message: 'Error updating user profile', error: 'Profile update error' })).to.be.true;
        });
    });
});
