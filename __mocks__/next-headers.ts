export const cookies = jest.fn().mockResolvedValue({
  getAll: () => [],
  set: jest.fn(),
})

export const headers = jest.fn().mockReturnValue(new Map())
