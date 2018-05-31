#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <fcntl.h>
#include <string.h>
#include <sys/wait.h>

void main() {
    int fd1[2];
    int fd2[2];

    pid_t pid;
    int buf;

    if (pipe(fd1) == -1) {
        printf("couldn't create first pipe!\n");
        exit(EXIT_FAILURE);
    }

    if (pipe(fd2) == -1) {
        printf("couldn't create second pipe!\n");
        close(fd1[1]);          // cleaning up!
        close(fd1[2]);          //
        exit(EXIT_FAILURE);
    }

    pid = fork();
    if (pid == -1) {
        printf("couldn't create new process!\n");
        close(fd1[0]);          // cleaning up
        close(fd1[1]);
        close(fd2[0]);
        close(fd2[1]);

    }else if (pid == 0) {
        // char *msg = "hello from child!!!\n";

        close(fd1[0]);          // child uses fd1 to write and fd2 to read
        close(fd2[1]);

        read(fd2[0], buf, sizeof(int));
        printf("msg from parent: %d\n", buf);
        // write(fd1[1], 5, sizeof(int));

        close(fd1[1]);      // final cleanup
        close(fd2[0]);      //

    }else {
        // char *msg = "hello from parent!!!\n";
        int r = rand() % 10;
        
        close(fd1[1]);          // parent uses fd1 to read and fd2 to write
        close(fd2[0]);

        write(fd2[1], &r, sizeof(int));
        read(fd1[0], buf, sizeof(int));
        printf("msg from child: %n\n", buf);

        close(fd1[0]);      // final cleanup
        close(fd2[1]);      //
    }

}