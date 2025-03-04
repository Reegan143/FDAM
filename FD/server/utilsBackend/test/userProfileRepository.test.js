const { expect } = require('chai');
const sinon = require('sinon');
const UserProfileRepository = require('../src/repositories/userProfileRepository');
const UserModel = require('../src/models/userModel');

describe('UserProfileRepository', () => {
    let userStub;

    beforeEach(() => {
        sinon.restore();
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('getUserByEmail', () => {
        it('should return user profile when email is found', async () => {
            const mockUser = { email: 'user@example.com', name: 'John Doe' };
            userStub = sinon.stub(UserModel, 'findOne').resolves(mockUser);

            const result = await UserProfileRepository.getUserByEmail('user@example.com');

            expect(result).to.deep.equal(mockUser);
            expect(userStub.calledOnceWith({ email: 'user@example.com' }, { password: 0 })).to.be.true;
        });

        it('should return null if user is not found', async () => {
            userStub = sinon.stub(UserModel, 'findOne').resolves(null);

            const result = await UserProfileRepository.getUserByEmail('user@example.com');

            expect(result).to.be.null;
        });
    });

    describe('updateUserProfile', () => {
        it('should update user profile successfully', async () => {
            const mockUpdatedUser = { email: 'user@example.com', name: 'John Updated' };
            userStub = sinon.stub(UserModel, 'findOneAndUpdate').resolves(mockUpdatedUser);

            const result = await UserProfileRepository.updateUserProfile('user@example.com', { name: 'John Updated' });

            expect(result).to.deep.equal(mockUpdatedUser);
            expect(userStub.calledOnceWith({ email: 'user@example.com' }, { name: 'John Updated' }, { new: true })).to.be.true;
        });

        it('should return null if update fails', async () => {
            userStub = sinon.stub(UserModel, 'findOneAndUpdate').resolves(null);

            const result = await UserProfileRepository.updateUserProfile('user@example.com', { name: 'John Updated' });

            expect(result).to.be.null;
        });
    });

    describe('updateUserPassword', () => {
        it('should update user password successfully', async () => {
            const mockUpdatedUser = { email: 'user@example.com', password: 'hashedPassword' };
            userStub = sinon.stub(UserModel, 'findOneAndUpdate').resolves(mockUpdatedUser);

            const result = await UserProfileRepository.updateUserPassword('user@example.com', 'hashedPassword');

            expect(result).to.deep.equal(mockUpdatedUser);
            expect(userStub.calledOnceWith({ email: 'user@example.com' }, { password: 'hashedPassword' }, { new: true })).to.be.true;
        });

        it('should return null if password update fails', async () => {
            userStub = sinon.stub(UserModel, 'findOneAndUpdate').resolves(null);

            const result = await UserProfileRepository.updateUserPassword('user@example.com', 'hashedPassword');

            expect(result).to.be.null;
        });
    });
});
