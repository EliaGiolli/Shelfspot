import {
    SearchDocDtoSchema,
    SearchResponseSchema,
    OpenLibraryWorkResponseSchema,
    SubjectWorkDtoSchema,
    SubjectResponseSchema,
  } from './book-api.schema';
  
  describe('SearchDocDtoSchema', () => {
    it('should accept a valid search document', () => {
      const input = {
        key: '/works/OL45804W',
        title: 'Pride and Prejudice',
        author_name: ['Jane Austen'],
        cover_i: 12345,
        first_publish_year: 1813,
        subject: ['Fiction', 'Romance'],
      };
  
      const result = SearchDocDtoSchema.safeParse(input);
  
      expect(result.success).toBe(true);
    });
  
    it('should accept a document with only required fields', () => {
      const input = {
        key: '/works/OL45804W',
        title: 'Pride and Prejudice',
      };
  
      const result = SearchDocDtoSchema.safeParse(input);
  
      expect(result.success).toBe(true);
    });
  
    it('should reject a document without a key', () => {
      const input = {
        title: 'Pride and Prejudice',
      };
  
      const result = SearchDocDtoSchema.safeParse(input);
  
      expect(result.success).toBe(false);
    });
  
    it('should reject a document with an invalid title', () => {
      const input = {
        key: '/works/OL45804W',
        title: 123,
      };
  
      const result = SearchDocDtoSchema.safeParse(input);
  
      expect(result.success).toBe(false);
    });
  
    it('should reject invalid optional field types', () => {
      const input = {
        key: '/works/OL45804W',
        title: 'Pride and Prejudice',
        author_name: 'Jane Austen',
      };
  
      const result = SearchDocDtoSchema.safeParse(input);
  
      expect(result.success).toBe(false);
    });
  });
  
  describe('SearchResponseSchema', () => {
    it('should accept a valid search response', () => {
      const input = {
        numFound: 1,
        start: 0,
        docs: [
          {
            key: '/works/OL45804W',
            title: 'Pride and Prejudice',
            author_name: ['Jane Austen'],
          },
        ],
      };
  
      const result = SearchResponseSchema.safeParse(input);
  
      expect(result.success).toBe(true);
    });
  
    it('should accept an empty documents array', () => {
      const input = {
        numFound: 0,
        start: 0,
        docs: [],
      };
  
      const result = SearchResponseSchema.safeParse(input);
  
      expect(result.success).toBe(true);
    });
  
    it('should reject a response without numFound', () => {
      const input = {
        start: 0,
        docs: [],
      };
  
      const result = SearchResponseSchema.safeParse(input);
  
      expect(result.success).toBe(false);
    });
  
    it('should reject a response with invalid documents', () => {
      const input = {
        numFound: 1,
        start: 0,
        docs: [{ title: 'Pride and Prejudice' }],
      };
  
      const result = SearchResponseSchema.safeParse(input);
  
      expect(result.success).toBe(false);
    });
  });
  
  describe('OpenLibraryWorkResponseSchema', () => {
    const validWork = {
      key: '/works/OL45804W',
      title: 'Pride and Prejudice',
    };
  
    it('should accept a valid work with a string description', () => {
      const input = {
        ...validWork,
        description: 'A classic novel by Jane Austen.',
      };
  
      const result = OpenLibraryWorkResponseSchema.safeParse(input);
  
      expect(result.success).toBe(true);
    });
  
    it('should accept a description represented by an object', () => {
      const input = {
        ...validWork,
        description: {
          value: 'A classic novel by Jane Austen.',
        },
      };
  
      const result = OpenLibraryWorkResponseSchema.safeParse(input);
  
      expect(result.success).toBe(true);
    });
  
    it('should accept a work without optional fields', () => {
      const result = OpenLibraryWorkResponseSchema.safeParse(validWork);
  
      expect(result.success).toBe(true);
    });
  
    it('should accept a work with subjects and covers', () => {
      const input = {
        ...validWork,
        subjects: ['Fiction', 'Romance'],
        covers: [12345, 67890],
        first_publish_date: '1813',
      };
  
      const result = OpenLibraryWorkResponseSchema.safeParse(input);
  
      expect(result.success).toBe(true);
    });
  
    it('should reject a work without a title', () => {
      const input = {
        key: '/works/OL45804W',
      };
  
      const result = OpenLibraryWorkResponseSchema.safeParse(input);
  
      expect(result.success).toBe(false);
    });
  
    it('should reject an invalid description object', () => {
      const input = {
        ...validWork,
        description: {
          text: 'Invalid description structure',
        },
      };
  
      const result = OpenLibraryWorkResponseSchema.safeParse(input);
  
      expect(result.success).toBe(false);
    });
  
    it('should reject invalid covers', () => {
      const input = {
        ...validWork,
        covers: ['12345'],
      };
  
      const result = OpenLibraryWorkResponseSchema.safeParse(input);
  
      expect(result.success).toBe(false);
    });
  });
  
  describe('SubjectWorkDtoSchema', () => {
    const validWork = {
      key: '/works/OL45804W',
      title: 'Pride and Prejudice',
    };
  
    it('should accept a valid subject work', () => {
      const input = {
        ...validWork,
        authors: [
          {
            key: '/authors/OL21594A',
            name: 'Jane Austen',
          },
        ],
        cover_id: 12345,
        first_publish_year: 1813,
      };
  
      const result = SubjectWorkDtoSchema.safeParse(input);
  
      expect(result.success).toBe(true);
    });
  
    it('should accept a work without optional fields', () => {
      const result = SubjectWorkDtoSchema.safeParse(validWork);
  
      expect(result.success).toBe(true);
    });
  
    it('should reject an author without a name', () => {
      const input = {
        ...validWork,
        authors: [
          {
            key: '/authors/OL21594A',
          },
        ],
      };
  
      const result = SubjectWorkDtoSchema.safeParse(input);
  
      expect(result.success).toBe(false);
    });
  
    it('should reject an invalid cover ID', () => {
      const input = {
        ...validWork,
        cover_id: '12345',
      };
  
      const result = SubjectWorkDtoSchema.safeParse(input);
  
      expect(result.success).toBe(false);
    });
  });
  
  describe('SubjectResponseSchema', () => {
    it('should accept a valid subject response', () => {
      const input = {
        works: [
          {
            key: '/works/OL45804W',
            title: 'Pride and Prejudice',
            authors: [
              {
                key: '/authors/OL21594A',
                name: 'Jane Austen',
              },
            ],
          },
        ],
      };
  
      const result = SubjectResponseSchema.safeParse(input);
  
      expect(result.success).toBe(true);
    });
  
    it('should accept an empty works array', () => {
      const input = {
        works: [],
      };
  
      const result = SubjectResponseSchema.safeParse(input);
  
      expect(result.success).toBe(true);
    });
  
    it('should reject a response without works', () => {
      const input = {};
  
      const result = SubjectResponseSchema.safeParse(input);
  
      expect(result.success).toBe(false);
    });
  
    it('should reject invalid works', () => {
      const input = {
        works: [
          {
            title: 'Pride and Prejudice',
          },
        ],
      };
  
      const result = SubjectResponseSchema.safeParse(input);
  
      expect(result.success).toBe(false);
    });
  });
  