import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { catchError, Observable, throwError } from 'rxjs';
import { Course } from 'src/app/model/course.model';
import { Instructor } from 'src/app/model/Instructor.model';
import { PageResponse } from 'src/app/model/page.response.model';
import { InstructorsService } from 'src/app/services/instructors.service';
import { CoursesComponent } from '../courses/courses.component';
import { CoursesService } from 'src/app/services/courses.service';
import { EmailExistsValidator } from 'src/app/validators/emailexists.validator';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-teachers',
  templateUrl: './teachers.component.html',
  styleUrls: ['./teachers.component.css']
})


export class TeachersComponent implements OnInit {

  searchFormGroup!: FormGroup;
  instructorFormGroup!: FormGroup;
  updateInstructorFormGroup!: FormGroup;
  pageInstructors$!: Observable<PageResponse<Instructor>>;
  pageCourses$!: Observable<PageResponse<Course>>;

  modalInstructor!: Instructor;

  errorMessage!: string;
  coursesErrorMessage!: string;

  currentPage: number = 0;
  pageSize: number = 10;
  coursesCurrentPage: number = 0;
  coursesPageSize: number = 10;

  submitted: boolean = false;

  constructor(private modalService: NgbModal, 
              private fb: FormBuilder,
              private instructorService : InstructorsService,
              private courseService : CoursesService,
              private userService: UsersService) {}

  ngOnInit(): void {
    this.searchFormGroup = this.fb.group({
      keyword: this.fb.control('')
    })
    this.instructorFormGroup = this.fb.group({
      firstName: ["", Validators.required],
      lastName: ["", Validators.required],
      summary: ["", Validators.required],
      user: this.fb.group({
        email: ["", [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")], [EmailExistsValidator.validate(this.userService)]],
        password: ["", Validators.required]
      })
    })
    this.handleSearchInstructors()
  }


  getModal(content: any) {
    this.submitted = false;
    this.modalService.open(content, {size: 'xl'})
  }

  handleSearchInstructors() {
    let keyword = this.searchFormGroup.value.keyword
    this.pageInstructors$ = this.instructorService.searchInstructors(keyword, this.currentPage, this.pageSize).pipe(
      catchError(err => {
        this.errorMessage = err.message;
        return throwError(err)
      })
    )
  }

  gotoPage(page: number) {
    this.currentPage = page;
    this.handleSearchInstructors();
  }

  handleDeleteInstructor(i: Instructor) {
    let conf = confirm("Are you sure you want to delete -> "+i.firstName+" "+i.lastName+" ?");
    if (!conf) return;

    this.instructorService.deleteInstructor(i.instructorId).subscribe({
      next: () => {
        this.handleSearchInstructors();
      },
      error: err => {
        alert(err.message);
        console.log(err)
      }
    })
  }

  onCloseModal(modal: any) {
    modal.close();
    this.instructorFormGroup.reset();
  }

  onSaveInstructor(modal: any) {
    console.log(this.instructorFormGroup);
    this.submitted = true;
    if (this.instructorFormGroup.invalid) return;
    this.instructorService.saveInstructor(this.instructorFormGroup.value).subscribe({
      next: () => {
        alert("success Saving Instructor");
        this.handleSearchInstructors();
        this.instructorFormGroup.reset();
        this.submitted = false;
        modal.close();
      }, error: err => {
        alert(err.message)
        console.log(err)
      }
    })
  }

  getCoursesModal(i: Instructor, coursesContent: any) {
    this.coursesCurrentPage = 0;
    this.modalInstructor = i;
    this.handleSearchCourses(i);
    this.modalService.open(coursesContent, {size: 'xl'});
  }

  handleSearchCourses(i: Instructor) {
    this.pageCourses$ = this.courseService.getCoursesByInstructor(i.instructorId, this.coursesCurrentPage, this.coursesPageSize).pipe(
      catchError(err => {
        this.coursesErrorMessage = err.message;
        return throwError(err);
      })
    )
  }

  gotoCoursesPage(page: number) {
    this.coursesCurrentPage = page;
    this.handleSearchCourses(this.modalInstructor);
  }

}

