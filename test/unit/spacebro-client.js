import spacebroClient from '../../src/spacebro-client'

describe('spacebroClient', () => {
  describe('Connect function', () => {
    beforeEach(() => {
      spy(spacebroClient, 'connect')
      spacebroClient.connect()
    })

    it('should have been run once', () => {
      expect(spacebroClient.connect).to.have.been.calledOnce
      process.exit(0)
    })

    /*it('should have always returned hello', () => {
      expect(spacebroClient.greet).to.have.always.returned('hello')
    })*/
  })
})
