import { Instructor } from "./Instructor.model";

export interface Course{
    courseId: number;
    courseName: string;
    courseDescription: string;
    courseDuration: string;
    instructor: Instructor;
}